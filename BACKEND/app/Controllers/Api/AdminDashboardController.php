<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use Throwable;

class AdminDashboardController extends BaseController
{
    public function index()
    {
        // Check admin session
        if (!session()->get('admin_logged_in')) {
            return $this->response
                ->setStatusCode(401)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unauthorized. Admin login required.',
                ]);
        }

        try {
            $db = db_connect();

            // Dashboard statistics
            $totalReservations = $db->table('bookings')
                ->countAllResults();

            $totalTrips = $db->table('trips')
                ->countAllResults();

            $totalPassengers = $db->table('passengers')
                ->countAllResults();

            $totalPayments = $db->table('payment')
                ->countAllResults();

            // Recent reservations
            $recentReservations = $db->table('bookings b')
                ->select(
                    'b.booking_id,
                     p.full_name AS passenger_name,
                     t.trip_id,
                     b.booked_at AS booking_date,
                     b.booking_status AS status'
                )
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
                ->orderBy('b.booked_at', 'DESC')
                ->limit(5)
                ->get()
                ->getResultArray();

            foreach ($recentReservations as &$reservation) {
                $reservation['trip_name'] = 'Trip #' .
                    ($reservation['trip_id'] ?? 'N/A');

                $reservation['booking_date'] =
                    !empty($reservation['booking_date'])
                        ? date(
                            'M d, Y',
                            strtotime($reservation['booking_date'])
                        )
                        : '—';
            }

            unset($reservation);

            return $this->response->setJSON([
                'success' => true,
                'data' => [
                    'totalReservations' => $totalReservations,
                    'totalTrips' => $totalTrips,
                    'totalPassengers' => $totalPassengers,
                    'totalPayments' => $totalPayments,
                    'recentReservations' => $recentReservations,
                ],
            ]);

        } catch (Throwable $e) {
            log_message(
                'error',
                'Admin Dashboard API Error: ' . $e->getMessage()
            );

            return $this->response
                ->setStatusCode(500)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unable to load dashboard data.',
                ]);
        }
    }
}
