<?php

namespace App\Http\Requests\Observability;

use Illuminate\Foundation\Http\FormRequest;

class StoreAnalyticsEventsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'events' => ['required', 'array', 'min:1', 'max:25'],
            'events.*.category' => ['required', 'string', 'in:page_view,event,web_vital'],
            'events.*.name' => ['required', 'string', 'max:64'],
            'events.*.path' => ['nullable', 'string', 'max:255'],
            'events.*.value' => ['nullable', 'numeric'],
            'events.*.properties' => ['nullable', 'array'],
        ];
    }
}
