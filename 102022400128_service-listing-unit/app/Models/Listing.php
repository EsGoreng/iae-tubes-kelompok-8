<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Listing extends Model
{
    protected $fillable = [
        'unit_code',
        'unit_name',
        'tower',
        'floor',
        'room_number',
        'unit_type',
        'status',
        'tenant_name',
        'tenant_phone',
        'receipt_number',
    ];

    protected $casts = [
        'floor' => 'integer',
    ];
}
