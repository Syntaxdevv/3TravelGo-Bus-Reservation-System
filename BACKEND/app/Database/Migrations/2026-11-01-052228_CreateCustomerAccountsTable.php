<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateCustomerAccountsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'customer_id' => [
                'type'           => 'SERIAL',
            ],
            'passenger_id' => [
                'type' => 'INTEGER',
            ],
            'email' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
            ],
            'password_hash' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
            ],
            'created_at' => [
                'type' => 'TIMESTAMP',
                'null' => true,
            ],
            'updated_at' => [
                'type' => 'TIMESTAMP',
                'null' => true,
            ],
        ]);

        $this->forge->addKey('customer_id', true);
        $this->forge->addUniqueKey('passenger_id');
        $this->forge->addUniqueKey('email');

        $this->forge->createTable('customer_accounts', true);
    }

    public function down()
    {
        $this->forge->dropTable('customer_accounts', true);
    }
}
