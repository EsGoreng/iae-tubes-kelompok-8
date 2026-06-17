<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreContractRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
        {
            return [
                'tenant_id'  => ['required', 'string', 'exists:tenants,id'],
                'listing_id' => ['required', 'string', 'uuid'],
                'start_date' => ['required', 'date'],
                'end_date'   => ['required', 'date', 'after:start_date'],
                'status'     => ['required', 'string', 'in:DRAFT,ACTIVE,EXPIRED,TERMINATED'],
                'is_active'  => ['sometimes', 'boolean'],
            ];
        }
}
