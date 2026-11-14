<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run()
    {
        $email = 'admin@busgo.com';

        $existing = $this->db->table('admins')
            ->where('email', $email)
            ->countAllResults();

        if ($existing > 0) {
            echo "Admin account already exists.\n";
            return;
        }

        $this->db->table('admins')->insert([
            'name'       => 'System Admin',
            'email'      => $email,
            'password'   => password_hash('ChangeMe123!', PASSWORD_DEFAULT),
            'created_at' => date('Y-m-d H:i:s'),
        ]);

        echo "Admin account created successfully.\n";
    }
}
