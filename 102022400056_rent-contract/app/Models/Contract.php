<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contract extends Model
{
    use HasFactory, HasUuids;

    /**
     * Kolom yang dapat diisi secara massal (mass assignable).
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'tenant_id',
        'listing_id',
        'start_date',
        'end_date',
        'is_active',
        'status',
        'soap_receipt_number',
        'soap_audited_at',
    ];
    /**
     * Casting tipe data agar nilai dari database otomatis diubah
     * ke tipe data native PHP/Carbon saat diakses.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Relasi ke model Tenant.
     * Setiap kontrak dimiliki oleh satu tenant.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
