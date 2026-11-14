<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;

class CustomerReservationController extends BaseController
{
    /**
     * Check customer authentication.
     */
    private function authorizeCustomer()
    {
        if (
            !session()->get('customer_logged_in') ||
            !session()->get('passenger_id')
        ) {
            return $this->response
                ->setStatusCode(401)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unauthorized. Customer login required.',
                ]);
        }

        return null;
    }

    /**
     * Retrieve reservations belonging to the logged-in passenger.
     */
    private function getReservationRows(int $passengerId, ?string $reference = null): array
    {
        $db = db_connect();

        $builder = $db->table('bookings b')
            ->select('
                b.booking_id,
                b.booking_reference,
                b.booking_status,
                b.booked_at,
                p.passenger_id,
                p.full_name,
                p.email,
                p.phone,
                s.seat_number,
                t.trip_id,
                t.travel_date,
                t.departure_time,
                t.arrival_time,
                t.fare,
                t.bus_type,
                origin.terminal_name AS origin_name,
                destination.terminal_name AS destination_name,
                bo.operator_name,
                pay.payment_method,
                pay.payment_status,
                pay.amount,
                pay.payment_reference
            ')
            ->join('passengers p', 'p.passenger_id = b.passenger_id')
            ->join('seats s', 's.seat_id = b.seat_id')
            ->join('trips t', 't.trip_id = b.trip_id')
            ->join('terminals origin', 'origin.terminal_id = t.origin_terminal_id', 'left')
            ->join('terminals destination', 'destination.terminal_id = t.destination_terminal_id', 'left')
            ->join('bus_operators bo', 'bo.operator_id = t.operator_id', 'left')
            ->join('payment pay', 'pay.booking_id = b.booking_id', 'left')
            ->where('b.passenger_id', $passengerId)
            ->orderBy('b.booked_at', 'DESC')
            ->orderBy('s.seat_number', 'ASC');

        if ($reference !== null) {
            $builder->where('b.booking_reference', $reference);
        }

        return $builder->get()->getResultArray();
    }

    /**
     * Group multiple seat bookings under one booking reference.
     */
    private function groupReservations(array $rows): array
    {
        $grouped = [];

        $today = date('Y-m-d');

        foreach ($rows as $row) {
            $reference = $row['booking_reference'];

            if (!isset($grouped[$reference])) {
                $status = strtolower(trim((string) $row['booking_status']));
                $travelDate = date('Y-m-d', strtotime($row['travel_date']));

                if (in_array($status, ['cancelled', 'canceled'], true)) {
                    $category = 'cancelled';
                } elseif (
                    in_array($status, ['completed', 'finished'], true) ||
                    $travelDate < $today
                ) {
                    $category = 'completed';
                } else {
                    $category = 'upcoming';
                }

                $grouped[$reference] = [
                    'booking_id' => (int) $row['booking_id'],
                    'booking_reference' => $reference,
                    'trip_id' => (int) $row['trip_id'],
                    'passenger_name' => $row['full_name'],
                    'passenger_email' => $row['email'],
                    'passenger_phone' => $row['phone'],
                    'origin_name' => $row['origin_name'],
                    'destination_name' => $row['destination_name'],
                    'trip_name' => ($row['origin_name'] ?? 'Unknown') .
                        ' - ' . ($row['destination_name'] ?? 'Unknown'),
                    'operator_name' => $row['operator_name'],
                    'travel_date' => $row['travel_date'],
                    'departure_time' => $row['departure_time'],
                    'arrival_time' => $row['arrival_time'],
                    'bus_type' => $row['bus_type'],
                    'fare' => (float) $row['fare'],
                    'seat_numbers' => [],
                    'seat_count' => 0,
                    'seat_number' => '',
                    'booking_status' => $row['booking_status'],
                    'payment_method' => $row['payment_method'],
                    'payment_status' => $row['payment_status'],
                    'payment_reference' => $row['payment_reference'],
                    'total_amount' => (float) ($row['amount'] ?? 0),
                    'booking_date' => $row['booked_at'],
                    'category' => $category,
                    'bookings' => [],
                ];
            }

            $seatNumber = $row['seat_number'];

            if (!in_array($seatNumber, $grouped[$reference]['seat_numbers'], true)) {
                $grouped[$reference]['seat_numbers'][] = $seatNumber;
            }

            $grouped[$reference]['bookings'][] = [
                'booking_id' => (int) $row['booking_id'],
                'seat_number' => $seatNumber,
                'booking_status' => $row['booking_status'],
            ];

            $grouped[$reference]['seat_count'] =
                count($grouped[$reference]['seat_numbers']);

            $grouped[$reference]['seat_number'] =
                implode(', ', $grouped[$reference]['seat_numbers']);
        }

        return array_values($grouped);
    }

    /**
     * GET /api/customer/reservations
     */
    public function index()
    {
        $unauthorized = $this->authorizeCustomer();

        if ($unauthorized !== null) {
            return $unauthorized;
        }

        try {
            $passengerId = (int) session()->get('passenger_id');

            $rows = $this->getReservationRows($passengerId);
            $reservations = $this->groupReservations($rows);

            return $this->response->setJSON([
                'success' => true,
                'total' => count($reservations),
                'reservations' => $reservations,
            ]);
        } catch (\Throwable $e) {
            log_message('error', 'Customer reservations error: ' . $e->getMessage());

            return $this->response
                ->setStatusCode(500)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unable to load your reservations.',
                ]);
        }
    }

    /**
     * GET /api/customer/reservations/{reference}
     */
    public function show($reference = null)
    {
        $unauthorized = $this->authorizeCustomer();

        if ($unauthorized !== null) {
            return $unauthorized;
        }

        $reference = trim((string) $reference);

        if ($reference === '') {
            return $this->response
                ->setStatusCode(400)
                ->setJSON([
                    'success' => false,
                    'message' => 'Invalid booking reference.',
                ]);
        }

        try {
            $passengerId = (int) session()->get('passenger_id');

            $rows = $this->getReservationRows($passengerId, $reference);
            $reservations = $this->groupReservations($rows);

            if (empty($reservations)) {
                return $this->response
                    ->setStatusCode(404)
                    ->setJSON([
                        'success' => false,
                        'message' => 'Reservation not found.',
                    ]);
            }

            return $this->response->setJSON([
                'success' => true,
                'data' => $reservations[0],
            ]);
        } catch (\Throwable $e) {
            log_message('error', 'Customer reservation details error: ' . $e->getMessage());

            return $this->response
                ->setStatusCode(500)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unable to load reservation details.',
                ]);
        }
    }
}