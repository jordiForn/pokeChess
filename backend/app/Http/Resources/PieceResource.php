<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Piece */
class PieceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'side' => $this->side,
            'chess_type' => $this->chess_type,
            'pokemon_name' => $this->pokemon_name,
            'pokemon_type' => $this->pokemon_type,
            'sprite_url' => $this->sprite_url,
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
