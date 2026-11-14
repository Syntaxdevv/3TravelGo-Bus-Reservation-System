<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use Throwable;

class StaffCheckinController extends BaseController
{
    /**
     * Check if the current user is authenticated staff.
     */
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
     * GET /api/staff/check-in/{bookingReference}
     *
     * Retrieve reservation details using booking reference.
     */
    public function lookup($reference)
    {
        if ($auth = $this->authorizeStaff()) {
            return $auth;
        }

        try {
            $db = db_connect();

            $bookings = $db->table('bookings b')
                ->select("
                    b.booking_id,
                    b.booking_reference,
                    b.booking_status,
                    p.full_name AS passenger_name,
                    p.email AS passenger_email,
                    p.phone AS passenger_phone,
                    s.seat_number,
                    t.trip_id,
                    t.travel_date,
                    t.departure_time,
                    t.arrival_time,
                    t.bus_type,
                    origin.terminal_name AS origin_name,
                    destination.terminal_name AS destination_name,
                    bo.operator_name
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
                ->where('b.booking_reference', $reference)
                ->orderBy('s.seat_number', 'ASC')
                ->get()
                ->getResultArray();

            if (empty($bookings)) {
                return $this->response
                    ->setStatusCode(404)
                    ->setJSON([
                        'success' => false,
                        'message' => 'Reservation not found.',
                    ]);
            }

            $bookingIds = array_column($bookings, 'booking_id');

            // GET EXISTING CHECK-IN RECORDS
            $checkins = $db->table('booking_checkins')
                ->whereIn('booking_id', $bookingIds)
                ->get()
                ->getResultArray();

            $checkedInIds = array_map(
                'strval',
                array_column($checkins, 'booking_id')
            );

            // VALIDATE BOOKING STATUSES
            $allConfirmed = true;

            $statuses = [];

            foreach ($bookings as $booking) {
                $status = strtolower(
                    trim((string) $booking['booking_status'])
                );

                $statuses[] = $status;

                if ($status !== 'confirmed') {
                    $allConfirmed = false;
                }
            }

            // SHOW THE ACTUAL DATABASE STATUS
            $uniqueStatuses = array_unique($statuses);

            if (count($uniqueStatuses) === 1) {
                $bookingStatus = $bookings[0]['booking_status'];
            } else {
                $bookingStatus = 'mixed';
            }

            // CHECK IF ALL BOOKINGS ARE ALREADY CHECKED IN
            $checkedInCount = count($checkedInIds);

            $allCheckedIn = (
                $checkedInCount === count($bookingIds)
            );

            // CHECK-IN IS ALLOWED ONLY IF:
            // 1. ALL BOOKINGS ARE CONFIRMED.
            // 2. NO BOOKING HAS BEEN CHECKED IN YET.
            $canCheckIn = (
                $allConfirmed &&
                $checkedInCount === 0
            );

            return $this->response->setJSON([
                'success' => true,

                'data' => [
                    'booking_reference' => $reference,

                    'passenger_name' => $bookings[0]['passenger_name'],
                    'passenger_email' => $bookings[0]['passenger_email'],
                    'passenger_phone' => $bookings[0]['passenger_phone'],

                    'origin_name' => $bookings[0]['origin_name'],
                    'destination_name' => $bookings[0]['destination_name'],
                    'operator_name' => $bookings[0]['operator_name'],

                    'travel_date' => $bookings[0]['travel_date'],
                    'departure_time' => $bookings[0]['departure_time'],
                    'arrival_time' => $bookings[0]['arrival_time'],

                    'bus_type' => $bookings[0]['bus_type'],

                    // Actual status from database.
                    'booking_status' => $bookingStatus,

                    'checked_in' => $allCheckedIn,

                    'seat_numbers' => array_column(
                        $bookings,
                        'seat_number'
                    ),

                    'booking_ids' => $bookingIds,

                    'can_check_in' => $canCheckIn,
                ],
            ]);

        } catch (Throwable $e) {
            log_message(
                'error',
                'Staff Check-in Lookup Error: ' . $e->getMessage()
            );

            return $this->response
                ->setStatusCode(500)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unable to find reservation.',
                ]);
        }
    }

    /**
     * POST /api/staff/check-in
     *
     * Record check-in for all bookings under one reference.
     */
    public function store()
    {
        if ($auth = $this->authorizeStaff()) {
            return $auth;
        }

        // SAFELY READ JSON REQUEST
        $payload = $this->request->getJSON(true);

        $reference = is_array($payload)
            ? trim((string) ($payload['booking_reference'] ?? ''))
            : '';

        if ($reference === '') {
            return $this->response
                ->setStatusCode(400)
                ->setJSON([
                    'success' => false,
                    'message' => 'Booking reference is required.',
                ]);
        }

        $db = db_connect();

        try {
            $db->transBegin();

            // LOCK BOOKINGS TO PREVENT SIMULTANEOUS CHECK-IN.
            $bookings = $db->query(
                "SELECT booking_id, booking_status
                 FROM bookings
                 WHERE booking_reference = ?
                 FOR UPDATE",
                [$reference]
            )->getResultArray();

            if (empty($bookings)) {
                $db->transRollback();

                return $this->response
                    ->setStatusCode(404)
                    ->setJSON([
                        'success' => false,
                        'message' => 'Reservation not found.',
                    ]);
            }

            // ALL BOOKINGS MUST BE CONFIRMED.
            foreach ($bookings as $booking) {
                $status = strtolower(
                    trim((string) $booking['booking_status'])
                );

                if ($status !== 'confirmed') {
                    $db->transRollback();

                    return $this->response
                        ->setStatusCode(422)
                        ->setJSON([
                            'success' => false,
                            'message' => 'Only confirmed reservations can be checked in.',
                        ]);
                }
            }

            $bookingIds = array_column(
                $bookings,
                'booking_id'
            );

            // PREVENT DUPLICATE CHECK-IN.
            $existing = $db->table('booking_checkins')
                ->whereIn('booking_id', $bookingIds)
                ->countAllResults();

            if ($existing > 0) {
                $db->transRollback();

                return $this->response
                    ->setStatusCode(409)
                    ->setJSON([
                        'success' => false,
                        'message' => 'This reservation has already been checked in.',
                    ]);
            }

            $checkedInAt = date('Y-m-d H:i:s');

            // INSERT CHECK-IN RECORDS.
            foreach ($bookingIds as $bookingId) {
                $db->table('booking_checkins')->insert([
                    'booking_id' => $bookingId,
                    'checked_in_at' => $checkedInAt,
                ]);
            }

            // VERIFY TRANSACTION.
            if ($db->transStatus() === false) {
                $db->transRollback();

                return $this->response
                    ->setStatusCode(500)
                    ->setJSON([
                        'success' => false,
                        'message' => 'Unable to save passenger check-in.',
                    ]);
            }

            $db->transCommit();

            return $this->response->setJSON([
                'success' => true,
                'message' => 'Passenger check-in completed successfully.',

                'data' => [
                    'booking_reference' => $reference,
                    'checked_in_count' => count($bookingIds),
                    'checked_in_at' => $checkedInAt,
                ],
            ]);

        } catch (Throwable $e) {
            $db->transRollback();

            log_message(
                'error',
                'Staff Check-in Store Error: ' . $e->getMessage()
            );

            return $this->response
                ->setStatusCode(500)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unable to process check-in.',
                ]);
        }
    }
}
