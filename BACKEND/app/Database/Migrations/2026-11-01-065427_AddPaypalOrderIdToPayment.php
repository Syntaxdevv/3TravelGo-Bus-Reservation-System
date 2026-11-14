<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddPaypalOrderIdToPayment extends Migration
{
    public function up()
    {
        $this->forge->addColumn('payment', [
            'paypal_order_id' => [
                'type'       => 'VARCHAR',
                'constraint' => 100,
                'null'       => true,
                'after'      => 'payment_reference',
            ],
        ]);

        $this->db->query(
            'CREATE UNIQUE INDEX payment_paypal_order_id_unique
             ON public.payment (paypal_order_id)
             WHERE paypal_order_id IS NOT NULL'
        );
    }

    public function down()
    {
        $this->db->query(
            'DROP INDEX IF EXISTS public.payment_paypal_order_id_unique'
        );

        $this->forge->dropColumn('payment', 'paypal_order_id');
    }
}
