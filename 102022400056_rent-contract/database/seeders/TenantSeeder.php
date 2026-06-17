<?php

namespace Database\Seeders;

use App\Models\Tenant;
use Illuminate\Database\Seeder;

class TenantSeeder extends Seeder
{
    /**
     * Run the tenant seeds.
     */
    public function run(): void
    {
        Tenant::factory()->count(10)->create();
    }
}
