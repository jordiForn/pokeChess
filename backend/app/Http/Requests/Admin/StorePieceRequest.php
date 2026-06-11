<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePieceRequest extends FormRequest
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
            'side' => ['required', Rule::in(['white', 'black'])],
            'chess_type' => [
                'required',
                Rule::in(['pawn', 'rook', 'knight', 'bishop', 'queen', 'king']),
                Rule::unique('pieces')->where(fn ($query) => $query->where('side', $this->string('side')->toString())),
            ],
            'pokemon_name' => ['required', 'string', 'max:255'],
            'pokemon_type' => ['required', Rule::in(['normal', 'fighting', 'ghost'])],
            'sprite_url' => ['required', 'string', 'max:2048', 'url'],
        ];
    }
}
