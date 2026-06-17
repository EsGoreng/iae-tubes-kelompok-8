<?php

namespace Database\Seeders;

use App\Models\Listing;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Listing::query()->updateOrCreate(
            ['unit_code' => 'APT-A-0501'],
            [
                'unit_name' => 'Apartemen Tower A 501',
                'tower' => 'A',
                'floor' => 5,
                'room_number' => '501',
                'unit_type' => 'apartment',
                'status' => 'occupied',
                'tenant_name' => 'Budi Santoso',
                'tenant_phone' => '081234567890',
            ]
        );

        Listing::query()->updateOrCreate(
            ['unit_code' => 'APT-B-0808'],
            [
                'unit_name' => 'Apartemen Tower B 808',
                'tower' => 'B',
                'floor' => 8,
                'room_number' => '808',
                'unit_type' => 'apartment',
                'status' => 'available',
                'tenant_name' => null,
                'tenant_phone' => null,
            ]
        );
    }
}
