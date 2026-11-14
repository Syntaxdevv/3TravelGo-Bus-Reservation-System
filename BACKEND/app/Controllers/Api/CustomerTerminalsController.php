<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use Throwable;

class CustomerTerminalsController extends BaseController
{
    public function index()
    {
        try {
            $terminals = db_connect()
                ->table('terminals')
                ->select([
                    'terminal_id',
                    'terminal_name',
                    'city',
                ])
                ->orderBy('terminal_name', 'ASC')
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
                'Customer Terminals API Error: ' . $e->getMessage()
            );

            return $this->response
                ->setStatusCode(500)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unable to load terminals.',
                ]);
        }
    }
}
