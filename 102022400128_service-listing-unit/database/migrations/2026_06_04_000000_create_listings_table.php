<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listings', function (Blueprint $table): void {
            $table->id();
            $table->string('unit_code', 50)->unique();
            $table->string('unit_name', 150);
            $table->string('tower', 80);
            $table->unsignedInteger('floor');
            $table->string('room_number', 50);
            $table->string('unit_type', 80);
            $table->enum('status', ['available', 'occupied', 'maintenance'])->default('available');
            $table->string('tenant_name', 150)->nullable();
            $table->string('tenant_phone', 30)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
