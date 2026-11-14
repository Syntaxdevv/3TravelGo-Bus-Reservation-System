<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use Throwable;

class StaffPaymentsController extends BaseController
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
     * GET /api/staff/payments
     *
     * Query parameters:
     * page, per_page, search, status
     */
    public function index()
    {
        if ($auth = $this->authorizeStaff()) {
            return $auth;
        }

        try {
            $db = db_connect();

            $page = max(
                1,
                (int) ($this->request->getGet('page') ?? 1)
            );

            $perPage = (int) (
                $this->request->getGet('per_page') ?? 10
            );

            $perPage = max(5, min(50, $perPage));

            $search = trim(
                (string) ($this->request->getGet('search') ?? '')
            );

            $status = strtolower(trim(
                (string) ($this->request->getGet('status') ?? '')
            ));

            // Main payment records query.
            $builder = $db->table('payment pay')
                ->select("
                    pay.payment_id,
                    pay.booking_id,
                    pay.payment_method,
                    pay.payment_status,
                    pay.amount,
                    pay.payment_reference,
                    pay.created_at,
                    pay.paypal_order_id,

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

                    bo.operator_name
                ")
                ->join(
                    'bookings b',
                    'b.booking_id = pay.booking_id',
                    'left'
                )
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
                );

            // Search payment and booking information.
            if ($search !== '') {
                $searchTerm = strtolower($search);
                $escapedSearch = $db->escapeLikeString($searchTerm);

                $builder->groupStart()
                    ->where(
                        "LOWER(pay.payment_reference) LIKE '%{$escapedSearch}%'",
                        null,
                        false
                    )
                    ->orWhere(
                        "LOWER(b.booking_reference) LIKE '%{$escapedSearch}%'",
                        null,
                        false
                    )
                    ->orWhere(
                        "LOWER(p.full_name) LIKE '%{$escapedSearch}%'",
                        null,
                        false
                    )
                    ->orWhere(
                        "LOWER(p.email) LIKE '%{$escapedSearch}%'",
                        null,
                        false
                    )
                    ->orWhere(
                        "LOWER(pay.payment_method) LIKE '%{$escapedSearch}%'",
                        null,
                        false
                    )
                    ->orWhere(
                        "LOWER(bo.operator_name) LIKE '%{$escapedSearch}%'",
                        null,
                        false
                    )
                    ->orWhere(
                        "LOWER(origin.terminal_name) LIKE '%{$escapedSearch}%'",
                        null,
                        false
                    )
                    ->orWhere(
                        "LOWER(destination.terminal_name) LIKE '%{$escapedSearch}%'",
                        null,
                        false
                    )
                    ->groupEnd();
            }

            // Filter by payment status.
            $allowedStatuses = [
                'paid',
                'demo_paid',
                'completed',
                'success',
                'pending',
                'processing',
                'failed',
                'cancelled',
                'declined',
            ];

            if (
                $status !== '' &&
                in_array($status, $allowedStatuses, true)
            ) {
                $builder->where(
                    "LOWER(pay.payment_status) = " . $db->escape($status),
                    null,
                    false
                );
            }

            // Get total records before pagination.
            $countBuilder = clone $builder;
            $total = $countBuilder->countAllResults();

            // Get paginated payment records.
            $payments = $builder
                ->orderBy('pay.created_at', 'DESC')
                ->orderBy('pay.payment_id', 'DESC')
                ->limit($perPage, ($page - 1) * $perPage)
                ->get()
                ->getResultArray();

            // Get overall payment summary.
            $allPayments = $db->table('payment')
                ->select('payment_status, amount')
                ->get()
                ->getResultArray();

            $totalAmount = 0;
            $paidCount = 0;
            $pendingCount = 0;
            $failedCount = 0;

            foreach ($allPayments as $payment) {
                $paymentStatus = strtolower(
                    trim($payment['payment_status'] ?? '')
                );

                if (in_array(
                    $paymentStatus,
                    ['paid', 'demo_paid', 'completed', 'success'],
                    true
                )) {
                    $paidCount++;
                    $totalAmount += (float) ($payment['amount'] ?? 0);
                } elseif (in_array(
                    $paymentStatus,
                    ['pending', 'processing'],
                    true
                )) {
                    $pendingCount++;
                } elseif (in_array(
                    $paymentStatus,
                    ['failed', 'cancelled', 'declined'],
                    true
                )) {
                    $failedCount++;
                }
            }

            $lastPage = max(
                1,
                (int) ceil($total / $perPage)
            );

            return $this->response->setJSON([
                'success' => true,
                'data' => $payments,
                'summary' => [
                    'total_payments' => count($allPayments),
                    'total_amount' => $totalAmount,
                    'paid_count' => $paidCount,
                    'pending_count' => $pendingCount,
                    'failed_count' => $failedCount,
                ],
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total' => $total,
                    'last_page' => $lastPage,
                ],
            ]);

        } catch (Throwable $e) {
            log_message(
                'error',
                'Staff Payments API Error: ' . $e->getMessage()
            );

            return $this->response
                ->setStatusCode(500)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unable to load payment records.',
                ]);
        }
    }
}
