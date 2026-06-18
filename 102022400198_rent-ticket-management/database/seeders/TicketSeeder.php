<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Ticket;

class TicketSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Ticket::create([
            'listing_id' => 1,
            'contract_id' => 101,
            'tenant_name' => 'John Doe',
            'tenant_email' => 'johndoe@example.com',
            'description' => 'AC unit in the living room is not cooling properly.',
            'status' => 'open',
            'soap_receipt' => 'SOAP-REC-001',
        ]);

        // You can add more Ticket::create([]) entries here if needed
    }
}
