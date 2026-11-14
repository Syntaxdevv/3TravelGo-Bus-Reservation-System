<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use Throwable;

class StaffDashboardController extends BaseController
{
    public function index()
    {
        // Check staff session
        if (!session()->get('staff_logged_in')) {
            return $this->response
                ->setStatusCode(401)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unauthorized. Staff login required.',
                ]);
        }

        try {
            $db = db_connect();
            $today = date('Y-m-d');

            // TODAY'S TRIPS
            $todayTrips = $db->table('trips')
                ->where('travel_date', $today)
                ->countAllResults();

            // TOTAL RESERVATIONS
            $totalBookings = $db->table('bookings')
                ->countAllResults();

            // PENDING BOOKINGS
            $pendingBookings = $db->table('bookings')
                ->where('booking_status', 'pending')
                ->countAllResults();

            // CONFIRMED BOOKINGS
            $confirmedBookings = $db->table('bookings')
                ->where('booking_status', 'confirmed')
                ->countAllResults();

            // RECENT RESERVATIONS
            $recentBookings = $db->table('bookings b')
                ->select("
                    b.booking_reference,
                    p.full_name,
                    t.travel_date,
                    COALESCE(s.seat_number, bs.seat_number, '—') AS seat_number,
                    b.booking_status
                ")
                ->join(
                    'passengers p',
                    'p.passenger_id = b.passenger_id',
                    'left'
                )
                ->join(
                    'trips t',
                    't.trip_id = b.trip_id',
                    'left'
                )
                ->join(
                    'seats s',
                    's.seat_id = b.seat_id',
                    'left'
                )
                ->join(
                    'bus_seats bs',
                    'bs.bus_seat_id = b.bus_seat_id',
                    'left'
                )
                ->orderBy('b.booked_at', 'DESC')
                ->limit(5)
                ->get()
                ->getResultArray();

            // UPCOMING TRIPS
            $upcomingTrips = $db->table('trips t')
                ->select("
                    t.travel_date,
                    t.departure_time,
                    bo.operator_name,
                    t.bus_type,
                    t.arrival_time,
                    t.fare
                ")
                ->join(
                    'bus_operators bo',
                    'bo.operator_id = t.operator_id',
                    'left'
                )
                ->where('t.travel_date >=', $today)
                ->orderBy('t.travel_date', 'ASC')
                ->orderBy('t.departure_time', 'ASC')
                ->limit(5)
                ->get()
                ->getResultArray();

            return $this->response->setJSON([
                'success' => true,
                'data' => [
                    'todayTrips' => $todayTrips,
                    'totalBookings' => $totalBookings,
                    'pendingBookings' => $pendingBookings,
                    'confirmedBookings' => $confirmedBookings,
                    'recentBookings' => $recentBookings,
                    'upcomingTrips' => $upcomingTrips,
                ],
            ]);

        } catch (Throwable $e) {
            log_message(
                'error',
                'Staff Dashboard API Error: ' . $e->getMessage()
            );

            return $this->response
                ->setStatusCode(500)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unable to load staff dashboard data.',
                ]);
        }
    }
}