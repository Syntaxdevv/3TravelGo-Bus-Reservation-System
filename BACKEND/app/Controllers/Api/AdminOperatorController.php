<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use Throwable;

class AdminOperatorController extends BaseController
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
     * GET /api/admin/operators
     */
    public function index()
    {
        if ($auth = $this->authorizeAdmin()) {
            return $auth;
        }

        try {
            $db = db_connect();

            $operators = $db->table('bus_operators')
                ->select([
                    'operator_id',
                    'operator_name',
                    'is_active',
                    'contact_person',
                    'contact_number',
                    'email',
                    'address',
                ])
                ->orderBy('operator_id', 'DESC')
                ->get()
                ->getResultArray();

            $activeCount = 0;
            $inactiveCount = 0;

            foreach ($operators as $operator) {
                if (
                    filter_var(
                        $operator['is_active'],
                        FILTER_VALIDATE_BOOLEAN
                    )
                ) {
                    $activeCount++;
                } else {
                    $inactiveCount++;
                }
            }

            return $this->response->setJSON([
                'success' => true,
                'data' => $operators,
                'total' => count($operators),
                'summary' => [
                    'active_count' => $activeCount,
                    'inactive_count' => $inactiveCount,
                ],
            ]);

        } catch (Throwable $e) {
            log_message(
                'error',
                'Admin Operators API Error: ' . $e->getMessage()
            );

            return $this->response
                ->setStatusCode(500)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unable to load bus operators.',
                ]);
        }
    }

    /**
     * GET /api/admin/operators/{id}
     */
    public function show($id)
    {
        if ($auth = $this->authorizeAdmin()) {
            return $auth;
        }

        try {
            $operator = db_connect()
                ->table('bus_operators')
                ->where('operator_id', $id)
                ->get()
                ->getRowArray();

            if (!$operator) {
                return $this->response
                    ->setStatusCode(404)
                    ->setJSON([
                        'success' => false,
                        'message' => 'Bus operator not found.',
                    ]);
            }

            return $this->response->setJSON([
                'success' => true,
                'data' => $operator,
            ]);

        } catch (Throwable $e) {
            log_message(
                'error',
                'Admin Operator Details API Error: ' . $e->getMessage()
            );

            return $this->response
                ->setStatusCode(500)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unable to load operator details.',
                ]);
        }
    }
}
