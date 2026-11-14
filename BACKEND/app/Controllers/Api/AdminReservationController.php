<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use Throwable;

class AdminReservationController extends BaseController
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
     * GET /api/admin/reservations
     * Display all reservations.
     */
    public function index()
    {
        if ($auth = $this->authorizeAdmin()) {
            return $auth;
        }

        try {
            $db = db_connect();

            $reservations = $db->table('bookings b')
                ->select("
                    b.booking_id AS id,
                    b.booking_id,
                    b.booking_reference,
                    b.booking_status AS status,
                    b.booked_at AS booking_date,

                    p.full_name AS passenger_name,

                    s.seat_number,

                    CONCAT(
                        COALESCE(origin.terminal_name, 'Unknown'),
                        ' - ',
                        COALESCE(destination.terminal_name, 'Unknown')
                    ) AS trip_name,

                    t.trip_id,
                    t.travel_date,
                    t.departure_time,
                    t.arrival_time,
                    t.fare,

                    bo.operator_name,

                    pay.payment_method,
                    pay.payment_status,
                    pay.amount,
                    pay.payment_reference
                ")
                ->join(
                    'passengers p',
                    'p.passenger_id = b.passenger_id',
                    'left'
                )
                ->join(
                    'seats s',
                    's.seat_id = b.seat_id',
                    'left'
                )
                ->join(
                    'trips t',
                    't.trip_id = b.trip_id',
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
                ->join(
                    'bus_operators bo',
                    'bo.operator_id = t.operator_id',
                    'left'
                )
                ->join(
                    'payment pay',
                    'pay.booking_id = b.booking_id',
                    'left'
                )
                ->orderBy('b.booked_at', 'DESC')
                ->get()
                ->getResultArray();

            return $this->response->setJSON([
                'success' => true,
                'data' => $reservations,
                'total' => count($reservations),
            ]);

        } catch (Throwable $e) {
            log_message(
                'error',
                'Admin Reservations API Error: ' . $e->getMessage()
            );

            return $this->response
                ->setStatusCode(500)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unable to load reservations.',
                ]);
        }
    }

    /**
     * GET /api/admin/reservations/{id}
     * Display reservation details and checkout seats.
     */
    public function show($id)
    {
        if ($auth = $this->authorizeAdmin()) {
            return $auth;
        }

        try {
            $db = db_connect();

            $selectedBooking = $db->table('bookings b')
                ->select('b.booking_id, pay.payment_reference')
                ->join(
                    'payment pay',
                    'pay.booking_id = b.booking_id',
                    'left'
                )
                ->where('b.booking_id', (int) $id)
                ->get()
                ->getRowArray();

            if (!$selectedBooking) {
                return $this->response
                    ->setStatusCode(404)
                    ->setJSON([
                        'success' => false,
                        'message' => 'Reservation not found.',
                    ]);
            }

            $paymentReference = $selectedBooking['payment_reference'];

            $builder = $db->table('bookings b')
                ->select("
                    b.booking_id,
                    b.booking_reference,
                    b.booking_status,
                    b.booked_at,

                    p.full_name AS passenger_name,
                    p.email AS passenger_email,
                    p.phone AS passenger_phone,

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
                ")
                ->join(
                    'passengers p',
                    'p.passenger_id = b.passenger_id',
                    'left'
                )
                ->join(
                    'seats s',
                    's.seat_id = b.seat_id',
                    'left'
                )
                ->join(
                    'trips t',
                    't.trip_id = b.trip_id',
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
                ->join(
                    'bus_operators bo',
                    'bo.operator_id = t.operator_id',
                    'left'
                )
                ->join(
                    'payment pay',
                    'pay.booking_id = b.booking_id',
                    'left'
                );

            if (!empty($paymentReference)) {
                $builder->where(
                    'pay.payment_reference',
                    $paymentReference
                );
            } else {
                $builder->where(
                    'b.booking_id',
                    (int) $id
                );
            }

            $bookings = $builder
                ->orderBy('s.seat_number', 'ASC')
                ->get()
                ->getResultArray();

            if (empty($bookings)) {
                return $this->response
                    ->setStatusCode(404)
                    ->setJSON([
                        'success' => false,
                        'message' => 'Reservation details not found.',
                    ]);
            }

            $first = $bookings[0];

            $selectedSeats = [];
            $totalAmount = 0;

            foreach ($bookings as $booking) {
                if (!empty($booking['seat_number'])) {
                    $selectedSeats[] = $booking['seat_number'];
                }

                $totalAmount += (float) ($booking['amount'] ?? 0);
            }

            $reservation = [
                'booking_id' => $first['booking_id'],
                'booking_reference' => $first['booking_reference'],
                'payment_reference' => $paymentReference,

                'passenger_name' => $first['passenger_name'],
                'passenger_email' => $first['passenger_email'],
                'passenger_phone' => $first['passenger_phone'],

                'origin_name' => $first['origin_name'],
                'destination_name' => $first['destination_name'],
                'operator_name' => $first['operator_name'],

                'travel_date' => $first['travel_date'],
                'departure_time' => $first['departure_time'],
                'arrival_time' => $first['arrival_time'],
                'bus_type' => $first['bus_type'],

                'fare' => (float) $first['fare'],

                'seat_numbers' => $selectedSeats,
                'seat_count' => count($selectedSeats),

                'total_amount' => $totalAmount,

                'payment_method' => $first['payment_method'],
                'payment_status' => $first['payment_status'],
                'booking_status' => $first['booking_status'],

                'bookings' => $bookings,
            ];

            return $this->response->setJSON([
                'success' => true,
                'data' => $reservation,
            ]);

        } catch (Throwable $e) {
            log_message(
                'error',
                'Admin Reservation Details API Error: ' . $e->getMessage()
            );

            return $this->response
                ->setStatusCode(500)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unable to load reservation details.',
                ]);
        }
    }
}
