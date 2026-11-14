<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use Throwable;

class StaffSeatsController extends BaseController
{
    private function authorizeStaff()
    {
        if (!session()->get('staff_logged_in')) {
            return $this->response
                ->setStatusCode(401)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unauthorized. Staff login required.',
                ]);
        }

        return null;
    }

    /**
     * GET /api/staff/seats
     */
    public function index()
    {
        if ($auth = $this->authorizeStaff()) {
            return $auth;
        }

        try {
            $seats = db_connect()
                ->table('seats s')
                ->select([
                    's.seat_id',
                    's.trip_id',
                    's.seat_number',
                    's.status',
                    't.travel_date',
                    't.departure_time',
                    't.arrival_time',
                    't.bus_type',
                    'origin.terminal_name AS origin_name',
                    'destination.terminal_name AS destination_name',
                    'bo.operator_name',
                ])
                ->join('trips t', 't.trip_id = s.trip_id', 'left')
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
                ->join(
                    'bus_operators bo',
                    'bo.operator_id = t.operator_id',
                    'left'
                )
                ->orderBy('s.trip_id', 'DESC')
                ->orderBy('s.seat_number', 'ASC')
                ->get()
                ->getResultArray();

            $summary = [
                'total_seats' => count($seats),
                'available_count' => 0,
                'reserved_count' => 0,
                'occupied_count' => 0,
                'other_count' => 0,
            ];

            foreach ($seats as $seat) {
                $status = strtolower(trim($seat['status'] ?? ''));

                if ($status === 'available') {
                    $summary['available_count']++;
                } elseif ($status === 'reserved') {
                    $summary['reserved_count']++;
                } elseif ($status === 'occupied') {
                    $summary['occupied_count']++;
                } else {
                    $summary['other_count']++;
                }
            }

            return $this->response->setJSON([
                'success' => true,
                'data' => $seats,
                'total' => count($seats),
                'summary' => $summary,
            ]);

        } catch (Throwable $e) {
            log_message(
                'error',
                'Staff Seats API Error: ' . $e->getMessage()
            );

            return $this->response
                ->setStatusCode(500)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unable to load seats.',
                ]);
        }
    }

    /**
     * GET /api/staff/seats/{id}
     */
    public function show($id)
    {
        if ($auth = $this->authorizeStaff()) {
            return $auth;
        }

        try {
            $seat = db_connect()
                ->table('seats s')
                ->select([
                    's.seat_id',
                    's.trip_id',
                    's.seat_number',
                    's.status',
                    't.travel_date',
                    't.departure_time',
                    't.arrival_time',
                    't.bus_type',
                    'origin.terminal_name AS origin_name',
                    'destination.terminal_name AS destination_name',
                    'bo.operator_name',
                ])
                ->join('trips t', 't.trip_id = s.trip_id', 'left')
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
                ->join(
                    'bus_operators bo',
                    'bo.operator_id = t.operator_id',
                    'left'
                )
                ->where('s.seat_id', $id)
                ->get()
                ->getRowArray();

            if (!$seat) {
                return $this->response
                    ->setStatusCode(404)
                    ->setJSON([
                        'success' => false,
                        'message' => 'Seat not found.',
                    ]);
            }

            return $this->response->setJSON([
                'success' => true,
                'data' => $seat,
            ]);

        } catch (Throwable $e) {
            log_message(
                'error',
                'Staff Seat Details API Error: ' . $e->getMessage()
            );

            return $this->response
                ->setStatusCode(500)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unable to load seat details.',
                ]);
        }
    }
}
