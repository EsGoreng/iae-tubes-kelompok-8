<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContractResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tenant_id' => $this->tenant_id,
            'listing_id' => $this->listing_id,
            'start_date' => $this->start_date?->format('Y-m-d'),
            'end_date' => $this->end_date?->format('Y-m-d'),
            'is_active' => $this->is_active,
            'status' => $this->status,
            'tenant' => [
                'id' => $this->tenant?->id,
                'name' => $this->tenant?->name,
                'email' => $this->tenant?->email,
                'phone' => $this->tenant?->phone,
            ],
            'soap_receipt_number' => $this->soap_receipt_number,
            'soap_audited_at'     => $this->soap_audited_at,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
