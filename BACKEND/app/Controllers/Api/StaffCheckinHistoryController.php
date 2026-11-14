<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;

class StaffCheckinHistoryController extends BaseController
{
    private function authorizeStaff()
    {
        if (!session()->get('staff_logged_in')) {
            return $this->response
                ->setStatusCode(401)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unauthorized staff access.',
                ]);
        }

        return null;
    }

    public function index()
    {
        $authResponse = $this->authorizeStaff();

        if ($authResponse !== null) {
            return $authResponse;
        }

        $db = \Config\Database::connect();

        $page = max(1, (int) $this->request->getGet('page'));
        $perPage = (int) ($this->request->getGet('per_page') ?? 10);
        $perPage = min(50, max(5, $perPage));

        $search = trim((string) ($this->request->getGet('search') ?? ''));

        $where = '';
        $bindings = [];

        if ($search !== '') {
            $where = "
                WHERE
                    b.booking_reference ILIKE ?
                    OR p.full_name ILIKE ?
                    OR t_origin.terminal_name ILIKE ?
                    OR t_destination.terminal_name ILIKE ?
                    OR bo.operator_name ILIKE ?
                    OR COALESCE(bs.seat_number, s.seat_number::text, '') ILIKE ?
            ";

            $keyword = '%' . $search . '%';

            $bindings = [
                $keyword,
                $keyword,
                $keyword,
                $keyword,
                $keyword,
                $keyword,
            ];
        }

        $fromAndJoins = "
            FROM booking_checkins bc
            INNER JOIN bookings b
                ON b.booking_id = bc.booking_id
            LEFT JOIN passengers p
                ON p.passenger_id = b.passenger_id
            LEFT JOIN trips t
                ON t.trip_id = b.trip_id
            LEFT JOIN terminals t_origin
                ON t_origin.terminal_id = t.origin_id
            LEFT JOIN terminals t_destination
                ON t_destination.terminal_id = t.destination_id
            LEFT JOIN bus_operators bo
                ON bo.operator_id = t.operator_id
            LEFT JOIN bus_seats bs
                ON bs.bus_seat_id = b.bus_seat_id
            LEFT JOIN seats s
                ON s.seat_id = b.seat_id
            {$where}
        ";

        $countQuery = $db->query(
            "SELECT COUNT(*) AS total {$fromAndJoins}",
            $bindings
        );

        $total = (int) ($countQuery->getRowArray()['total'] ?? 0);

        $offset = ($page - 1) * $perPage;

        $historyQuery = $db->query(
            "
                SELECT
                    bc.checkin_id,
                    bc.checked_in_at,
                    b.booking_id,
                    b.booking_reference,
                    b.booking_status,
                    p.full_name AS passenger_name,
                    p.email AS passenger_email,
                    p.phone AS passenger_phone,
                    t_origin.terminal_name AS origin_name,
                    t_destination.terminal_name AS destination_name,
                    t.travel_date,
                    t.departure_time,
                    t.arrival_time,
                    bo.operator_name,
                    COALESCE(
                        bs.seat_number,
                        s.seat_number::text,
                        '—'
                    ) AS seat_number
                {$fromAndJoins}
                ORDER BY bc.checked_in_at DESC, bc.checkin_id DESC
                LIMIT ? OFFSET ?
            ",
            array_merge($bindings, [$perPage, $offset])
        );

        $history = $historyQuery->getResultArray();

        return $this->response->setJSON([
            'success' => true,
            'data' => $history,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => max(1, (int) ceil($total / $perPage)),
            ],
        ]);
    }
}
