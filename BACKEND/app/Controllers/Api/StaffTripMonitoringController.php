<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use DateTimeImmutable;
use DateTimeZone;
use Throwable;

class StaffTripMonitoringController extends BaseController
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
     * GET /api/staff/trip-monitoring
     */
    public function index()
    {
        if ($auth = $this->authorizeStaff()) {
            return $auth;
        }

        try {
            $db = db_connect();

            $sql = "
                SELECT
                    t.trip_id,
                    t.travel_date,
                    t.departure_time,
                    t.arrival_time,
                    t.status AS trip_status,
                    t.fare,
                    t.bus_type,

                    bo.operator_name,

                    origin.terminal_name AS origin_name,
                    destination.terminal_name AS destination_name,

                    b.bus_number,
                    b.plate_number,
                    b.seat_capacity,

                    COALESCE(bs.passenger_count, 0) AS passenger_count,
                    COALESCE(cs.checked_in_count, 0) AS checked_in_count

                FROM trips t

                LEFT JOIN bus_operators bo
                    ON bo.operator_id = t.operator_id

                LEFT JOIN terminals origin
                    ON origin.terminal_id = t.origin_id

                LEFT JOIN terminals destination
                    ON destination.terminal_id = t.destination_id

                LEFT JOIN buses b
                    ON b.bus_id = t.bus_id

                LEFT JOIN (
                    SELECT
                        trip_id,
                        COUNT(*) AS passenger_count
                    FROM bookings
                    WHERE booking_status = 'confirmed'
                    GROUP BY trip_id
                ) bs
                    ON bs.trip_id = t.trip_id

                LEFT JOIN (
                    SELECT
                        bk.trip_id,
                        COUNT(*) AS checked_in_count
                    FROM booking_checkins bc
                    INNER JOIN bookings bk
                        ON bk.booking_id = bc.booking_id
                    WHERE bk.booking_status = 'confirmed'
                    GROUP BY bk.trip_id
                ) cs
                    ON cs.trip_id = t.trip_id

                ORDER BY
                    t.travel_date ASC,
                    t.departure_time ASC
            ";

            $trips = $db->query($sql)->getResultArray();

            $timezone = new DateTimeZone('Asia/Manila');
            $now = new DateTimeImmutable('now', $timezone);

            $summary = [
                'upcoming' => 0,
                'ongoing' => 0,
                'completed' => 0,
                'cancelled' => 0,
                'total' => count($trips),
            ];

            foreach ($trips as &$trip) {
                $storedStatus = strtolower(
                    trim((string) $trip['trip_status'])
                );

                if ($storedStatus === 'cancelled') {
                    $monitoringStatus = 'cancelled';
                } elseif ($storedStatus !== 'scheduled') {
                    $monitoringStatus = $storedStatus;
                } else {
                    $departure = new DateTimeImmutable(
                        $trip['travel_date'] . ' ' . $trip['departure_time'],
                        $timezone
                    );

                    $arrival = new DateTimeImmutable(
                        $trip['travel_date'] . ' ' . $trip['arrival_time'],
                        $timezone
                    );

                    // Arrival can be on the following day.
                    if ($arrival < $departure) {
                        $arrival = $arrival->modify('+1 day');
                    }

                    if ($now < $departure) {
                        $monitoringStatus = 'upcoming';
                    } elseif ($now >= $departure && $now < $arrival) {
                        $monitoringStatus = 'ongoing';
                    } else {
                        $monitoringStatus = 'completed';
                    }
                }

                $trip['monitoring_status'] = $monitoringStatus;

                $summaryKey = $monitoringStatus;

                if (array_key_exists($summaryKey, $summary)) {
                    $summary[$summaryKey]++;
                }
            }

            unset($trip);

            return $this->response->setJSON([
                'success' => true,
                'summary' => $summary,
                'data' => $trips,
            ]);

        } catch (Throwable $e) {
            log_message(
                'error',
                'Staff Trip Monitoring API Error: ' . $e->getMessage()
            );

            return $this->response
                ->setStatusCode(500)
                ->setJSON([
                    'success' => false,
                    'message' => 'Unable to load trip monitoring data.',
                ]);
        }
    }
}
