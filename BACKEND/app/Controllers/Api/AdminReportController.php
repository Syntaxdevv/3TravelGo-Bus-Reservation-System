<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use Throwable;

class AdminReportController extends BaseController
{
    public function index()
    {
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

            // Reservation summary
            $bookingSummary = $db->table('bookings')
                ->select('booking_status, COUNT(*) AS total')
                ->groupBy('booking_status')
                ->get()
                ->getResultArray();

            $totalReservations = $db->table('bookings')
                ->countAllResults();

            // Payment summary
            $paymentSummary = $db->table('payment')
                ->select('payment_status, COUNT(*) AS total, COALESCE(SUM(amount), 0) AS amount')
                ->groupBy('payment_status')
                ->get()
                ->getResultArray();

            $totalPayments = $db->table('payment')
                ->countAllResults();

            $demoRevenue = $db->table('payment')
                ->selectSum('amount', 'total')
                ->where('payment_status', 'demo_paid')
                ->get()
                ->getRowArray();

            // Payment methods
            $paymentMethods = $db->table('payment')
                ->select('payment_method, COUNT(*) AS total, COALESCE(SUM(amount), 0) AS amount')
                ->groupBy('payment_method')
                ->get()
                ->getResultArray();

            // Monthly reservations (last 12 months)
            $monthlyReservations = $db->query("
                SELECT
                    TO_CHAR(DATE_TRUNC('month', booked_at), 'Mon YYYY') AS month,
                    COUNT(*) AS total
                FROM bookings
                WHERE booked_at >= CURRENT_DATE - INTERVAL '11 months'
                GROUP BY DATE_TRUNC('month', booked_at)
                ORDER BY DATE_TRUNC('month', booked_at)
            ")->getResultArray();

            // Monthly demo revenue (last 12 months)
            $monthlyRevenue = $db->query("
                SELECT
                    TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
                    COALESCE(SUM(amount), 0) AS total
                FROM payment
                WHERE payment_status = 'demo_paid'
                  AND created_at >= CURRENT_DATE - INTERVAL '11 months'
                GROUP BY DATE_TRUNC('month', created_at)
                ORDER BY DATE_TRUNC('month', created_at)
            ")->getResultArray();

            // Trip summary
            $totalTrips = $db->table('trips')
                ->countAllResults();

            $tripStatuses = $db->table('trips')
                ->select('status, COUNT(*) AS total')
                ->groupBy('status')
                ->get()
                ->getResultArray();

            // Top routes based on reservations
            $topRoutes = $db->table('bookings b')
                ->select("
                    origin.terminal_name AS origin_name,
                    destination.terminal_name AS destination_name,
                    COUNT(b.booking_id) AS total_reservations
                ")
                ->join('trips t', 't.trip_id = b.trip_id', 'left')
                ->join('terminals origin', 'origin.terminal_id = t.origin_id', 'left')
                ->join('terminals destination', 'destination.terminal_id = t.destination_id', 'left')
                ->groupBy([
                    'origin.terminal_name',
                    'destination.terminal_name',
                ])
                ->orderBy('total_reservations', 'DESC')
                ->limit(5)
                ->get()
                ->getResultArray();

            return $this->response->setJSON([
                'success' => true,
                'data' => [
                    'overview' => [
                        'total_reservations' => $totalReservations,
                        'total_payments' => $totalPayments,
                        'demo_revenue' => (float) ($demoRevenue['total'] ?? 0),
                        'total_trips' => $totalTrips,
                    ],
                    'booking_summary' => $bookingSummary,
                    'payment_summary' => $paymentSummary,
                    'payment_methods' => $paymentMethods,
                    'monthly_reservations' => $monthlyReservations,
                    'monthly_revenue' => $monthlyRevenue,
                    'trip_statuses' => $tripStatuses,
                    'top_routes' => $topRoutes,
                ],
            ]);

        } catch (Throwable $e) {
            log_message(
                'error',
                'Admin Reports API Error: ' . $e->getMessage()
            );

            return $this->response
                ->setStatusCode(500)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unable to load reports data.',
                ]);
        }
    }
}
