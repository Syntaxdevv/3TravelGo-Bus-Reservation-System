<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use Throwable;

class AdminTerminalController extends BaseController
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
     * GET /api/admin/terminals
     */
    public function index()
    {
        if ($auth = $this->authorizeAdmin()) {
            return $auth;
        }

        try {
            $terminals = db_connect()
                ->table('terminals')
                ->select([
                    'terminal_id',
                    'terminal_name',
                    'city',
                ])
                ->orderBy('terminal_id', 'DESC')
                ->get()
                ->getResultArray();

            return $this->response->setJSON([
                'success' => true,
                'data' => $terminals,
                'total' => count($terminals),
            ]);

        } catch (Throwable $e) {
            log_message(
                'error',
                'Admin Terminals API Error: ' . $e->getMessage()
            );

            return $this->response
                ->setStatusCode(500)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unable to load terminals.',
                ]);
        }
    }

    /**
     * GET /api/admin/terminals/{id}
     */
    public function show($id)
    {
        if ($auth = $this->authorizeAdmin()) {
            return $auth;
        }

        try {
            $terminal = db_connect()
                ->table('terminals')
                ->where('terminal_id', $id)
                ->get()
                ->getRowArray();

            if (!$terminal) {
                return $this->response
                    ->setStatusCode(404)
                    ->setJSON([
                        'success' => false,
                        'message' => 'Terminal not found.',
                    ]);
            }

            return $this->response->setJSON([
                'success' => true,
                'data' => $terminal,
            ]);

        } catch (Throwable $e) {
            log_message(
                'error',
                'Admin Terminal Details API Error: ' . $e->getMessage()
            );

            return $this->response
                ->setStatusCode(500)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unable to load terminal details.',
                ]);
        }
    }
}
