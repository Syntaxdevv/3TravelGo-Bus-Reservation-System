<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;

class CustomerAuthController extends BaseController
{
    public function register()
    {
        $data = $this->request->getJSON(true) ?? [];

        $fullName = trim((string) ($data['full_name'] ?? ''));
        $email = strtolower(trim((string) ($data['email'] ?? '')));
        $phone = trim((string) ($data['phone'] ?? ''));
        $password = (string) ($data['password'] ?? '');
        $passwordConfirm = (string) ($data['password_confirm'] ?? '');

        if (
            $fullName === '' ||
            $email === '' ||
            $password === '' ||
            $passwordConfirm === ''
        ) {
            return $this->response->setStatusCode(422)->setJSON([
                'success' => false,
                'message' => 'Please complete all required fields.',
            ]);
        }

        if (
            strlen($fullName) < 3 ||
            strlen($fullName) > 255 ||
            !filter_var($email, FILTER_VALIDATE_EMAIL) ||
            strlen($email) > 255 ||
            strlen($phone) > 30
        ) {
            return $this->response->setStatusCode(422)->setJSON([
                'success' => false,
                'message' => 'Please provide valid registration details.',
            ]);
        }

        if (strlen($password) < 8) {
            return $this->response->setStatusCode(422)->setJSON([
                'success' => false,
                'message' => 'Password must be at least 8 characters.',
            ]);
        }

        if ($password !== $passwordConfirm) {
            return $this->response->setStatusCode(422)->setJSON([
                'success' => false,
                'message' => 'Passwords do not match.',
            ]);
        }

        $db = db_connect();

        $existing = $db->table('customer_accounts')
            ->where('email', $email)
            ->get()
            ->getRowArray();

        if ($existing) {
            return $this->response->setStatusCode(409)->setJSON([
                'success' => false,
                'message' => 'This email is already registered.',
            ]);
        }

        $db->transBegin();

        try {
            $db->table('passengers')->insert([
                'full_name' => $fullName,
                'email' => $email,
                'phone' => $phone,
            ]);

            $passengerId = $db->insertID();

            if (!$passengerId) {
                throw new \RuntimeException(
                    'Unable to create passenger record.'
                );
            }

            $db->table('customer_accounts')->insert([
                'passenger_id' => $passengerId,
                'email' => $email,
                'password_hash' => password_hash(
                    $password,
                    PASSWORD_DEFAULT
                ),
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ]);

            if ($db->transStatus() === false) {
                throw new \RuntimeException(
                    'Unable to create customer account.'
                );
            }

            $db->transCommit();

            return $this->response->setStatusCode(201)->setJSON([
                'success' => true,
                'message' => 'Registration successful. You can now log in.',
            ]);

        } catch (\Throwable $e) {
            $db->transRollback();

            log_message(
                'error',
                'Customer API registration failed: ' . $e->getMessage()
            );

            return $this->response->setStatusCode(500)->setJSON([
                'success' => false,
                'message' => 'Registration failed. Please try again.',
            ]);
        }
    }

    public function login()
    {
        $data = $this->request->getJSON(true) ?? [];

        $email = strtolower(trim((string) ($data['email'] ?? '')));
        $password = (string) ($data['password'] ?? '');

        if ($email === '' || $password === '') {
            return $this->response->setStatusCode(422)->setJSON([
                'success' => false,
                'message' => 'Please enter your email and password.',
            ]);
        }

        $db = db_connect();

        $customer = $db->table('customer_accounts ca')
            ->select('ca.customer_id, ca.passenger_id, ca.email, ca.password_hash, p.full_name, p.phone')
            ->join('passengers p', 'p.passenger_id = ca.passenger_id')
            ->where('ca.email', $email)
            ->get()
            ->getRowArray();

        if (
            !$customer ||
            !password_verify($password, $customer['password_hash'])
        ) {
            return $this->response->setStatusCode(401)->setJSON([
                'success' => false,
                'message' => 'Invalid email or password.',
            ]);
        }

        session()->regenerate(true);

        session()->set([
            'customer_logged_in' => true,
            'customer_id' => $customer['customer_id'],
            'passenger_id' => $customer['passenger_id'],
            'customer_email' => $customer['email'],
            'customer_name' => $customer['full_name'],
        ]);

        return $this->response->setJSON([
            'success' => true,
            'message' => 'Login successful.',
            'data' => [
                'customer_id' => $customer['customer_id'],
                'passenger_id' => $customer['passenger_id'],
                'name' => $customer['full_name'],
                'email' => $customer['email'],
                'phone' => $customer['phone'],
            ],
        ]);
    }

    public function check()
    {
        if (!session()->get('customer_logged_in')) {
            return $this->response->setStatusCode(401)->setJSON([
                'success' => false,
                'message' => 'Not authenticated.',
            ]);
        }

        return $this->response->setJSON([
            'success' => true,
            'data' => [
                'customer_id' => session()->get('customer_id'),
                'passenger_id' => session()->get('passenger_id'),
                'name' => session()->get('customer_name'),
                'email' => session()->get('customer_email'),
            ],
        ]);
    }

    public function logout()
    {
        session()->remove([
            'customer_logged_in',
            'customer_id',
            'passenger_id',
            'customer_email',
            'customer_name',
            'customer_redirect',
            'trip_id',
            'selected_seat_id',
            'passenger',
            'demo_booking',
        ]);

        session()->regenerate(true);

        return $this->response->setJSON([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }
}
