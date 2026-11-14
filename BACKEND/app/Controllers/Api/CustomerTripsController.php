<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use DateTimeImmutable;
use DateTimeZone;
use Throwable;

class CustomerTripsController extends BaseController
{
    /**
     * GET /api/customer/trips
     *
     * Optional query parameters:
     * origin_id
     * destination_id
     * travel_date
     */
    public function index()
    {
        try {
            $db = db_connect();

            // Always use Philippine local time.
            $now = new DateTimeImmutable(
                'now',
                new DateTimeZone('Asia/Manila')
            );

            $today = $now->format('Y-m-d');
            $currentTime = $now->format('H:i:s');

            $originId = $this->request->getGet('origin_id');
            $destinationId = $this->request->getGet('destination_id');
            $travelDate = $this->request->getGet('travel_date');

            // Validate origin.
            if (
                $originId !== null &&
                (!ctype_digit((string) $originId) || (int) $originId <= 0)
            ) {
                return $this->response->setStatusCode(400)->setJSON([
                    'success' => false,
                    'message' => 'Invalid origin terminal.',
                ]);
            }

            // Validate destination.
            if (
                $destinationId !== null &&
                (!ctype_digit((string) $destinationId) || (int) $destinationId <= 0)
            ) {
                return $this->response->setStatusCode(400)->setJSON([
                    'success' => false,
                    'message' => 'Invalid destination terminal.',
                ]);
            }

            // Origin and destination must be different.
            if (
                $originId !== null &&
                $destinationId !== null &&
                (int) $originId === (int) $destinationId
            ) {
                return $this->response->setStatusCode(400)->setJSON([
                    'success' => false,
                    'message' => 'Origin and destination must be different.',
                ]);
            }

            // Validate travel date format.
            if (
                $travelDate !== null &&
                !preg_match('/^\d{4}-\d{2}-\d{2}$/', $travelDate)
            ) {
                return $this->response->setStatusCode(400)->setJSON([
                    'success' => false,
                    'message' => 'Invalid travel date.',
                ]);
            }

            if ($travelDate !== null) {
                $date = DateTimeImmutable::createFromFormat(
                    '!Y-m-d',
                    $travelDate,
                    new DateTimeZone('Asia/Manila')
                );

                if (!$date || $date->format('Y-m-d') !== $travelDate) {
                    return $this->response->setStatusCode(400)->setJSON([
                        'success' => false,
                        'message' => 'Invalid travel date.',
                    ]);
                }

                // Do not return trips from past dates.
                if ($travelDate < $today) {
                    return $this->response->setJSON([
                        'success' => true,
                        'data' => [],
                        'total' => 0,
                    ]);
                }
            }

            $builder = $db->table('trips t')
                ->select("
                    t.trip_id,
                    t.bus_id,
                    t.operator_id,
                    t.origin_id,
                    t.destination_id,
                    t.travel_date,
                    t.departure_time,
                    t.arrival_time,
                    t.fare,
                    t.bus_type,
                    t.status,

                    bo.operator_name,

                    origin.terminal_name AS origin_name,
                    origin.city AS origin_city,

                    destination.terminal_name AS destination_name,
                    destination.city AS destination_city,

                    b.bus_number,
                    b.seat_capacity
                ")
                ->join(
                    'bus_operators bo',
                    'bo.operator_id = t.operator_id',
                    'inner'
                )
                ->join(
                    'terminals origin',
                    'origin.terminal_id = t.origin_id',
                    'inner'
                )
                ->join(
                    'terminals destination',
                    'destination.terminal_id = t.destination_id',
                    'inner'
                )
                ->join(
                    'buses b',
                    'b.bus_id = t.bus_id',
                    'inner'
                )
                ->where('LOWER(t.status)', 'scheduled')
                ->where('bo.is_active', true)
                ->where('b.is_active', true);

            // Date and time filtering.
            if ($travelDate !== null) {

                $builder->where('t.travel_date', $travelDate);

                // For today, only show trips that have not departed.
                if ($travelDate === $today) {
                    $builder->where(
                        't.departure_time >',
                        $currentTime
                    );
                }

            } else {

                // Include all future dates.
                // For today, include only trips with future departure times.
                $builder->groupStart()
                    ->where('t.travel_date >', $today)
                    ->orGroupStart()
                        ->where('t.travel_date', $today)
                        ->where('t.departure_time >', $currentTime)
                    ->groupEnd()
                ->groupEnd();
            }

            // Apply optional origin filter.
            if ($originId !== null && $originId !== '') {
                $builder->where('t.origin_id', (int) $originId);
            }

            // Apply optional destination filter.
            if ($destinationId !== null && $destinationId !== '') {
                $builder->where('t.destination_id', (int) $destinationId);
            }

            $trips = $builder
                ->orderBy('t.travel_date', 'ASC')
                ->orderBy('t.departure_time', 'ASC')
                ->get()
                ->getResultArray();

            // Calculate seat availability for every trip.
            foreach ($trips as &$trip) {
                $busId = (int) $trip['bus_id'];
                $tripId = (int) $trip['trip_id'];

                $totalSeats = (int) $db->table('bus_seats')
                    ->where('bus_id', $busId)
                    ->countAllResults();

                // Count unique booked seats.
                $bookedResult = $db->table('bookings b')
                    ->select(
                        'COUNT(DISTINCT b.bus_seat_id) AS total',
                        false
                    )
                    ->where('b.trip_id', $tripId)
                    ->whereIn('b.booking_status', [
                        'pending',
                        'confirmed',
                        'paid',
                    ])
                    ->where('b.bus_seat_id IS NOT NULL', null, false)
                    ->get()
                    ->getRowArray();

                $bookedSeats = (int) ($bookedResult['total'] ?? 0);

                $trip['total_seats'] = $totalSeats;
                $trip['booked_seats'] = $bookedSeats;

                $trip['available_seats'] = max(
                    0,
                    $totalSeats - $bookedSeats
                );

                $trip['fare'] = (float) $trip['fare'];
                $trip['seat_capacity'] = (int) $trip['seat_capacity'];
            }

            unset($trip);

            return $this->response->setJSON([
                'success' => true,
                'data' => $trips,
                'total' => count($trips),
            ]);

        } catch (Throwable $e) {

            log_message(
                'error',
                'Customer Trips API Error: ' . $e->getMessage()
            );

            return $this->response->setStatusCode(500)->setJSON([
                'success' => false,
                'message' => 'Unable to load available trips.',
            ]);
        }
    }
}
