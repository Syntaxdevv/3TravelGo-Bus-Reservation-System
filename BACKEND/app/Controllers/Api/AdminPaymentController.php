<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use Throwable;

class AdminPaymentController extends BaseController
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
     * GET /api/admin/payments
     */
    public function index()
    {
        if ($auth = $this->authorizeAdmin()) {
            return $auth;
        }

        try {
            $db = db_connect();

            $payments = $db->table('payment')
                ->select([
                    'payment_id',
                    'booking_id',
                    'payment_method',
                    'payment_status',
                    'amount',
                    'payment_reference',
                    'created_at',
                    'paypal_order_id',
                ])
                ->orderBy('created_at', 'DESC')
                ->orderBy('payment_id', 'DESC')
                ->get()
                ->getResultArray();

            $totalAmount = 0;
            $paidCount = 0;
            $pendingCount = 0;
            $failedCount = 0;

            foreach ($payments as $payment) {
                $status = strtolower(
                    trim($payment['payment_status'] ?? '')
                );

                if (in_array($status, ['paid', 'demo_paid', 'completed', 'success'], true)) {
                    $paidCount++;
                    $totalAmount += (float) ($payment['amount'] ?? 0);
                } elseif (in_array($status, ['pending', 'processing'], true)) {
                    $pendingCount++;
                } elseif (in_array($status, ['failed', 'cancelled', 'declined'], true)) {
                    $failedCount++;
                }
            }

            return $this->response->setJSON([
                'success' => true,
                'data' => $payments,
                'total' => count($payments),
                'summary' => [
                    'total_amount' => $totalAmount,
                    'paid_count' => $paidCount,
                    'pending_count' => $pendingCount,
                    'failed_count' => $failedCount,
                ],
            ]);

        } catch (Throwable $e) {
            log_message(
                'error',
                'Admin Payments API Error: ' . $e->getMessage()
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
