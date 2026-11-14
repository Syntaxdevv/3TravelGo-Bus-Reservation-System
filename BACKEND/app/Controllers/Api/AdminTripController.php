<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use Throwable;

class AdminTripController extends BaseController
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
     * GET /api/admin/trips
     */
    public function index()
    {
        if ($auth = $this->authorizeAdmin()) {
            return $auth;
        }

        try {
            $db = db_connect();

            $trips = $db->table('trips t')
                ->select("
                    t.trip_id,
                    t.operator_id,
                    t.origin_id,
                    t.destination_id,
                    t.travel_date,
                    t.departure_time,
                    t.arrival_time,
                    t.fare,
                    t.bus_type,
                    t.status,

                    bo.operator_name,

                    origin.terminal_name AS origin_name,
                    destination.terminal_name AS destination_name
                ")
                ->join(
                    'bus_operators bo',
                    'bo.operator_id = t.operator_id',
                    'left'
                )
                ->join(
                    'terminals origin',
                    'origin.terminal_id = t.origin_id',
                    'left'
                )
                ->join(
                    'terminals destination',
                    'destination.terminal_id = t.destination_id',
                    'left'
                )
                ->orderBy('t.travel_date', 'DESC')
                ->orderBy('t.departure_time', 'ASC')
                ->get()
                ->getResultArray();

            return $this->response->setJSON([
                'success' => true,
                'data' => $trips,
                'total' => count($trips),
            ]);

        } catch (Throwable $e) {
            log_message(
                'error',
                'Admin Trips API Error: ' . $e->getMessage()
            );

            return $this->response
                ->setStatusCode(500)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unable to load trips.',
                ]);
        }
    }
}
