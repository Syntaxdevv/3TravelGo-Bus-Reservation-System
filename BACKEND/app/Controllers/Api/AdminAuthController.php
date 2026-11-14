<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;

class AdminAuthController extends BaseController
{
    public function login()
    {
        $data = $this->request->getJSON(true);

        $email = trim((string) ($data['email'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        if ($email === '' || $password === '') {
            return $this->response
                ->setStatusCode(422)
                ->setJSON([
                    'success' => false,
                    'message' => 'Please enter your email and password.',
                ]);
        }

        $db = db_connect();

        $account = $db->table('admins')
            ->where('email', $email)
            ->get()
            ->getRowArray();

        if (
            !$account ||
            !password_verify($password, $account['password'])
        ) {
            return $this->response
                ->setStatusCode(401)
                ->setJSON([
                    'success' => false,
                    'message' => 'Invalid email or password.',
                ]);
        }

        $role = strtolower(trim((string) ($account['role'] ?? '')));

        if (!in_array($role, ['admin', 'staff'], true)) {
            return $this->response
                ->setStatusCode(403)
                ->setJSON([
                    'success' => false,
                    'message' => 'This account does not have access.',
                ]);
        }

        session()->regenerate(true);

        session()->remove([
            'admin_id',
            'admin_name',
            'admin_email',
            'admin_logged_in',
            'staff_id',
            'staff_name',
            'staff_email',
            'staff_logged_in',
        ]);

        if ($role === 'admin') {
            session()->set([
                'admin_id'        => $account['admin_id'],
                'admin_name'      => $account['name'],
                'admin_email'     => $account['email'],
                'admin_logged_in' => true,
            ]);
        }

        if ($role === 'staff') {
            session()->set([
                'staff_id'        => $account['admin_id'],
                'staff_name'      => $account['name'],
                'staff_email'     => $account['email'],
                'staff_logged_in' => true,
            ]);
        }

        return $this->response->setJSON([
            'success' => true,
            'message' => 'Login successful.',
            'data' => [
                'id' => $account['admin_id'],
                'name' => $account['name'],
                'email' => $account['email'],
                'role' => $role,
            ],
        ]);
    }

    public function check()
    {
        if (!session()->get('admin_logged_in')) {
            return $this->response
                ->setStatusCode(401)
                ->setJSON([
                    'success' => false,
                    'message' => 'Not authenticated.',
                ]);
        }

        return $this->response->setJSON([
            'success' => true,
            'data' => [
                'id' => session()->get('admin_id'),
                'name' => session()->get('admin_name'),
                'email' => session()->get('admin_email'),
                'role' => 'admin',
            ],
        ]);
    }

    public function staffCheck()
    {
        if (!session()->get('staff_logged_in')) {
            return $this->response
                ->setStatusCode(401)
                ->setJSON([
                    'success' => false,
                    'message' => 'Not authenticated.',
                ]);
        }

        return $this->response->setJSON([
            'success' => true,
            'data' => [
                'id' => session()->get('staff_id'),
                'name' => session()->get('staff_name'),
                'email' => session()->get('staff_email'),
                'role' => 'staff',
            ],
        ]);
    }

    public function logout()
    {
        session()->remove([
            'admin_id',
            'admin_name',
            'admin_email',
            'admin_logged_in',
        ]);

        session()->regenerate(true);

        return $this->response->setJSON([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    public function staffLogout()
    {
        session()->remove([
            'staff_id',
            'staff_name',
            'staff_email',
            'staff_logged_in',
        ]);

        session()->regenerate(true);

        return $this->response->setJSON([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }
}
