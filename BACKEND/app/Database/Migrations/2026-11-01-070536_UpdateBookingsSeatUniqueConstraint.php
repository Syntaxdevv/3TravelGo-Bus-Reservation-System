<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class UpdateBookingsSeatUniqueConstraint extends Migration
{
    public function up()
    {
        // Remove the old unique constraint on seat_id.
        $this->db->query("
            ALTER TABLE public.bookings
            DROP CONSTRAINT IF EXISTS bookings_seat_id_key
        ");

        // Only pending and confirmed bookings can occupy a seat.
        $this->db->query("
            CREATE UNIQUE INDEX bookings_active_seat_unique
            ON public.bookings (seat_id)
            WHERE booking_status IN ('pending', 'confirmed')
        ");
    }

    public function down()
    {
        // Restore the original unique constraint.
        $this->db->query("
            DROP INDEX IF EXISTS public.bookings_active_seat_unique
        ");

        $this->db->query("
            ALTER TABLE public.bookings
            ADD CONSTRAINT bookings_seat_id_key UNIQUE (seat_id)
        ");
    }
}