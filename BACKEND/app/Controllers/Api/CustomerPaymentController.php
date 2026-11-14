<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use Throwable;

class CustomerPaymentController extends BaseController
{
    /**
     * POST /api/customer/payment/process
     *
     * Demo payment flow:
     * Successful submission automatically marks payment as paid
     * and booking as confirmed.
     */
    public function process()
    {
        $customerId = session()->get('customer_id');
        $passengerId = session()->get('passenger_id');

        if (
            !$customerId ||
            !$passengerId ||
            !session()->get('customer_logged_in')
        ) {
            return $this->response
                ->setStatusCode(401)
                ->setJSON([
                    'success' => false,
                    'message' => 'Please log in before proceeding.',
                ]);
        }

        $data = $this->request->getJSON(true) ?? [];

        $tripId = filter_var(
            $data['trip_id'] ?? null,
            FILTER_VALIDATE_INT
        );

        $seatIds = $data['seat_ids'] ?? [];
        $passengers = $data['passengers'] ?? [];
        $paymentMethod = trim($data['payment_method'] ?? '');

        // Validate trip.
        if (!$tripId || $tripId < 1) {
            return $this->response
                ->setStatusCode(400)
                ->setJSON([
                    'success' => false,
                    'message' => 'Invalid trip information.',
                ]);
        }

        // Validate seats.
        if (
            !is_array($seatIds) ||
            count($seatIds) < 1 ||
            count($seatIds) > 5
        ) {
            return $this->response
                ->setStatusCode(400)
                ->setJSON([
                    'success' => false,
                    'message' => 'You can reserve between 1 and 5 seats.',
                ]);
        }

        $seatIds = array_map('intval', $seatIds);

        if (
            in_array(0, $seatIds, true) ||
            count(array_unique($seatIds)) !== count($seatIds)
        ) {
            return $this->response
                ->setStatusCode(400)
                ->setJSON([
                    'success' => false,
                    'message' => 'Invalid or duplicate seat selection.',
                ]);
        }

        // Validate passenger information.
        if (
            !is_array($passengers) ||
            count($passengers) !== count($seatIds)
        ) {
            return $this->response
                ->setStatusCode(400)
                ->setJSON([
                    'success' => false,
                    'message' => 'Passenger information must match the selected seats.',
                ]);
        }

        // Validate payment method.
        $allowedMethods = ['PayPal', 'QR Ph', 'GCash'];

        if (!in_array($paymentMethod, $allowedMethods, true)) {
            return $this->response
                ->setStatusCode(400)
                ->setJSON([
                    'success' => false,
                    'message' => 'Invalid payment method.',
                ]);
        }

        foreach ($passengers as $index => $passenger) {
            if (!is_array($passenger)) {
                return $this->response
                    ->setStatusCode(400)
                    ->setJSON([
                        'success' => false,
                        'message' => 'Invalid passenger information.',
                    ]);
            }

            $phone = trim($passenger['contact_number'] ?? '');

            if ($phone === '') {
                return $this->response
                    ->setStatusCode(400)
                    ->setJSON([
                        'success' => false,
                        'message' => 'Passenger contact number is required.',
                    ]);
            }

            if ($index === 0) {
                continue;
            }

            $name = trim($passenger['full_name'] ?? '');
            $email = trim($passenger['email'] ?? '');

            if (
                $name === '' ||
                $email === '' ||
                !filter_var($email, FILTER_VALIDATE_EMAIL)
            ) {
                return $this->response
                    ->setStatusCode(400)
                    ->setJSON([
                        'success' => false,
                        'message' => 'Please provide valid information for every passenger.',
                    ]);
            }
        }

        $db = db_connect();

        try {
            // Verify customer account ownership.
            $account = $db->table('customer_accounts')
                ->where('customer_id', $customerId)
                ->where('passenger_id', $passengerId)
                ->get()
                ->getRowArray();

            if (!$account) {
                return $this->response
                    ->setStatusCode(403)
                    ->setJSON([
                        'success' => false,
                        'message' => 'Customer account verification failed.',
                    ]);
            }

            // Get the logged-in customer's passenger record.
            $mainPassenger = $db->table('passengers')
                ->where('passenger_id', $passengerId)
                ->get()
                ->getRowArray();

            if (!$mainPassenger) {
                return $this->response
                    ->setStatusCode(404)
                    ->setJSON([
                        'success' => false,
                        'message' => 'Customer passenger record not found.',
                    ]);
            }

            // Verify trip and get actual fare.
            $trip = $db->table('trips')
                ->select('trip_id, fare, travel_date')
                ->where('trip_id', $tripId)
                ->get()
                ->getRowArray();

            if (!$trip) {
                return $this->response
                    ->setStatusCode(404)
                    ->setJSON([
                        'success' => false,
                        'message' => 'Trip not found.',
                    ]);
            }

            $fare = (float) $trip['fare'];

            if ($fare <= 0) {
                return $this->response
                    ->setStatusCode(400)
                    ->setJSON([
                        'success' => false,
                        'message' => 'Invalid trip fare.',
                    ]);
            }

            // Start database transaction.
            $db->transBegin();

            // Lock selected seat records.
            $placeholders = implode(
                ',',
                array_fill(0, count($seatIds), '?')
            );

            $seatQuery = "
                SELECT seat_id, seat_number, status
                FROM seats
                WHERE trip_id = ?
                AND seat_id IN ($placeholders)
                ORDER BY seat_id
                FOR UPDATE
            ";

            $seatParameters = array_merge(
                [$tripId],
                $seatIds
            );

            $seats = $db->query(
                $seatQuery,
                $seatParameters
            )->getResultArray();

            if (count($seats) !== count($seatIds)) {
                $db->transRollback();

                return $this->response
                    ->setStatusCode(400)
                    ->setJSON([
                        'success' => false,
                        'message' => 'One or more selected seats do not belong to this trip.',
                    ]);
            }

            // Check seat availability.
            foreach ($seats as $seat) {
                if (
                    strtolower(trim($seat['status'] ?? '')) !== 'available'
                ) {
                    $db->transRollback();

                    return $this->response
                        ->setStatusCode(409)
                        ->setJSON([
                            'success' => false,
                            'message' => 'One or more selected seats are no longer available.',
                        ]);
                }
            }

            // Check existing active bookings.
            $existingBookings = $db->table('bookings')
                ->where('trip_id', $tripId)
                ->whereIn('seat_id', $seatIds)
                ->whereIn('booking_status', [
                    'pending',
                    'confirmed',
                    'paid',
                ])
                ->countAllResults();

            if ($existingBookings > 0) {
                $db->transRollback();

                return $this->response
                    ->setStatusCode(409)
                    ->setJSON([
                        'success' => false,
                        'message' => 'One or more selected seats have already been reserved.',
                    ]);
            }

            // Generate shared reservation reference.
            $reference = 'TG-' .
                date('YmdHis') .
                '-' .
                strtoupper(bin2hex(random_bytes(3)));

            $bookingIds = [];
            $reservedSeatNumbers = [];

            // Create booking and payment for every selected seat.
            foreach ($seats as $index => $seat) {

                if ($index === 0) {
                    // First passenger is the logged-in customer.
                    $currentPassengerId = (int) $passengerId;

                    $db->table('passengers')
                        ->where('passenger_id', $currentPassengerId)
                        ->update([
                            'phone' => trim(
                                $passengers[$index]['contact_number']
                            ),
                        ]);

                } else {
                    // Create additional passenger record.
                    $db->table('passengers')->insert([
                        'full_name' => trim(
                            $passengers[$index]['full_name']
                        ),
                        'email' => trim(
                            $passengers[$index]['email']
                        ),
                        'phone' => trim(
                            $passengers[$index]['contact_number']
                        ),
                    ]);

                    $currentPassengerId = (int) $db->insertID();

                    if (!$currentPassengerId) {
                        $db->transRollback();

                        return $this->response
                            ->setStatusCode(500)
                            ->setJSON([
                                'success' => false,
                                'message' => 'Unable to save passenger information.',
                            ]);
                    }
                }

                // Create confirmed booking.
                $db->table('bookings')->insert([
                    'passenger_id' => $currentPassengerId,
                    'trip_id' => $tripId,
                    'seat_id' => (int) $seat['seat_id'],
                    'booking_reference' => $reference,
                    'booking_status' => 'confirmed',
                ]);

                $bookingId = (int) $db->insertID();

                if (!$bookingId) {
                    $db->transRollback();

                    return $this->response
                        ->setStatusCode(500)
                        ->setJSON([
                            'success' => false,
                            'message' => 'Unable to create booking.',
                        ]);
                }

                // Create paid demo payment record.
                $db->table('payment')->insert([
                    'booking_id' => $bookingId,
                    'payment_method' => $paymentMethod,
                    'payment_status' => 'paid',
                    'amount' => $fare,
                    'payment_reference' => $reference,
                ]);

                if (!$db->insertID()) {
                    $db->transRollback();

                    return $this->response
                        ->setStatusCode(500)
                        ->setJSON([
                            'success' => false,
                            'message' => 'Unable to create payment record.',
                        ]);
                }

                // Mark seat as booked.
                $db->table('seats')
                    ->where('seat_id', (int) $seat['seat_id'])
                    ->where('trip_id', $tripId)
                    ->update([
                        'status' => 'booked',
                    ]);

                $bookingIds[] = $bookingId;
                $reservedSeatNumbers[] = $seat['seat_number'];
            }

            // Check transaction status.
            if ($db->transStatus() === false) {
                $db->transRollback();

                return $this->response
                    ->setStatusCode(500)
                    ->setJSON([
                        'success' => false,
                        'message' => 'Unable to complete reservation.',
                    ]);
            }

            // Commit transaction.
            $db->transCommit();

            return $this->response->setJSON([
                'success' => true,
                'message' => 'Reservation created and demo payment successful.',
                'data' => [
                    'booking_reference' => $reference,
                    'payment_reference' => $reference,
                    'booking_ids' => $bookingIds,
                    'seat_numbers' => $reservedSeatNumbers,
                    'seat_count' => count($bookingIds),
                    'total_amount' => $fare * count($bookingIds),
                    'payment_method' => $paymentMethod,
                    'payment_status' => 'paid',
                    'booking_status' => 'confirmed',
                ],
            ]);

        } catch (Throwable $e) {

            if ($db->transStatus() !== false) {
                $db->transRollback();
            }

            log_message(
                'error',
                'Customer Payment API Error: ' . $e->getMessage()
            );

            return $this->response
                ->setStatusCode(500)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unable to process reservation.',
                ]);
        }
    }
}
