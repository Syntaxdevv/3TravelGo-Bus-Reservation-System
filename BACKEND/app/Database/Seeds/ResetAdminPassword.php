<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class ResetAdminPassword extends Seeder
{
    public function run()
    {
        $newPassword = 'Acosta11';

        $this->db->table('admins')
            ->where('admin_id', 1)
            ->update([
                'password' => password_hash(
                    $newPassword,
                    PASSWORD_DEFAULT
                ),
            ]);

        echo "Admin password reset completed.\n";
    }
}
