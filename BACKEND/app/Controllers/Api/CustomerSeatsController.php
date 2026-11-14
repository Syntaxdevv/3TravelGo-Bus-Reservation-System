<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;
use Config\Database;

class CustomerSeatsController extends ResourceController
{
    protected $format = 'json';

    public function show($tripId = null)
    {
        if (!$tripId || !is_numeric($tripId)) {
            return $this->respond([
                'success' => false,
                'message' => 'Invalid trip ID.',
            ], 400);
        }

        $db = Database::connect();

        // GET TRIP, BUS AND OPERATOR INFORMATION
        $trip = $db->query("
            SELECT
                t.trip_id,
                t.bus_id,
                t.travel_date,
                TO_CHAR(t.departure_time, 'HH24:MI') AS departure_time,
                TO_CHAR(t.arrival_time, 'HH24:MI') AS arrival_time,
                t.fare,
                COALESCE(NULLIF(t.bus_type, ''), b.bus_type) AS bus_type,
                b.bus_number,
                b.seat_capacity,
                bo.operator_name
            FROM trips t
            LEFT JOIN buses b
                ON b.bus_id = t.bus_id
            LEFT JOIN bus_operators bo
                ON bo.operator_id = b.operator_id
            WHERE t.trip_id = ?
            LIMIT 1
        ", [(int) $tripId])->getRowArray();

        if (!$trip) {
            return $this->respond([
                'success' => false,
                'message' => 'Trip not found.',
            ], 404);
        }

        // GET ACTUAL SEATS FOR THE SELECTED TRIP
        $seats = $db->query("
            SELECT
                s.seat_id,
                s.seat_number,
                CASE
                    WHEN LOWER(s.status) = 'booked' THEN 'booked'

                    WHEN EXISTS (
                        SELECT 1
                        FROM bookings bk
                        WHERE bk.trip_id = s.trip_id
                        AND (
                            bk.seat_id = s.seat_id
                            OR (
                                bs.bus_seat_id IS NOT NULL
                                AND bk.bus_seat_id = bs.bus_seat_id
                            )
                        )
                        AND LOWER(bk.booking_status)
                            IN ('pending', 'confirmed', 'paid')
                    ) THEN 'booked'

                    ELSE 'available'
                END AS status

            FROM seats s

            INNER JOIN trips t
                ON t.trip_id = s.trip_id

            LEFT JOIN bus_seats bs
                ON bs.bus_id = t.bus_id
                AND CAST(s.seat_number AS INTEGER)
                    = CAST(bs.seat_number AS INTEGER)

            WHERE s.trip_id = ?

            ORDER BY CAST(s.seat_number AS INTEGER) ASC
        ", [(int) $tripId])->getResultArray();

        return $this->respond([
            'success' => true,
            'message' => 'Seat information retrieved successfully.',
            'trip' => $trip,
            'seats' => $seats,
        ]);
    }
}
