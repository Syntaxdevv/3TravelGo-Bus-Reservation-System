<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use Throwable;

class AdminPassengerController extends BaseController
{
    private function authorizeAdmin()
    {
        if (!session()->get('admin_logged_in')) {
            return $this->response
                ->setStatusCode(401)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unauthorized. Admin login required.',
                ]);
        }

        return null;
    }

    /**
     * GET /api/admin/passengers
     */
    public function index()
    {
        if ($auth = $this->authorizeAdmin()) {
            return $auth;
        }

        try {
            $db = db_connect();

            $passengers = $db->table('passengers')
                ->select([
                    'passenger_id',
                    'full_name',
                    'email',
                    'phone',
                ])
                ->orderBy('passenger_id', 'DESC')
                ->get()
                ->getResultArray();

            return $this->response->setJSON([
                'success' => true,
                'data' => $passengers,
                'total' => count($passengers),
            ]);

        } catch (Throwable $e) {
            log_message(
                'error',
                'Admin Passengers API Error: ' . $e->getMessage()
            );

            return $this->response
                ->setStatusCode(500)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unable to load passengers.',
                ]);
        }
    }

    /**
     * GET /api/admin/passengers/{id}
     */
    public function show($id)
    {
        if ($auth = $this->authorizeAdmin()) {
            return $auth;
        }

        try {
            $db = db_connect();

            $passenger = $db->table('passengers')
                ->where('passenger_id', $id)
                ->get()
                ->getRowArray();

            if (!$passenger) {
                return $this->response
                    ->setStatusCode(404)
                    ->setJSON([
                        'success' => false,
                        'message' => 'Passenger not found.',
                    ]);
            }

            return $this->response->setJSON([
                'success' => true,
                'data' => $passenger,
            ]);

        } catch (Throwable $e) {
            log_message(
                'error',
                'Admin Passenger Details API Error: ' . $e->getMessage()
            );

            return $this->response
                ->setStatusCode(500)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unable to load passenger details.',
                ]);
        }
    }
}
