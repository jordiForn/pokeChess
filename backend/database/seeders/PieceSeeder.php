<?php

namespace Database\Seeders;

use App\Models\Piece;
use Illuminate\Database\Seeder;

class PieceSeeder extends Seeder
{
    public function run(): void
    {
        $pieces = [
            // Blancas
            ['side' => 'white', 'chess_type' => 'king', 'pokemon_name' => 'Snorlax', 'pokemon_type' => 'normal', 'sprite_url' => $this->spriteUrl(143)],
            ['side' => 'white', 'chess_type' => 'queen', 'pokemon_name' => 'Lucario', 'pokemon_type' => 'fighting', 'sprite_url' => $this->spriteUrl(448)],
            ['side' => 'white', 'chess_type' => 'rook', 'pokemon_name' => 'Machoke', 'pokemon_type' => 'fighting', 'sprite_url' => $this->spriteUrl(67)],
            ['side' => 'white', 'chess_type' => 'bishop', 'pokemon_name' => 'Haunter', 'pokemon_type' => 'ghost', 'sprite_url' => $this->spriteUrl(93)],
            ['side' => 'white', 'chess_type' => 'knight', 'pokemon_name' => 'Primeape', 'pokemon_type' => 'fighting', 'sprite_url' => $this->spriteUrl(57)],
            ['side' => 'white', 'chess_type' => 'pawn', 'pokemon_name' => 'Rattata', 'pokemon_type' => 'normal', 'sprite_url' => $this->spriteUrl(19)],
            // Negras
            ['side' => 'black', 'chess_type' => 'king', 'pokemon_name' => 'Slaking', 'pokemon_type' => 'normal', 'sprite_url' => $this->spriteUrl(289)],
            ['side' => 'black', 'chess_type' => 'queen', 'pokemon_name' => 'Gallade', 'pokemon_type' => 'fighting', 'sprite_url' => $this->spriteUrl(475)],
            ['side' => 'black', 'chess_type' => 'rook', 'pokemon_name' => 'Machamp', 'pokemon_type' => 'fighting', 'sprite_url' => $this->spriteUrl(68)],
            ['side' => 'black', 'chess_type' => 'bishop', 'pokemon_name' => 'Gengar', 'pokemon_type' => 'ghost', 'sprite_url' => $this->spriteUrl(94)],
            ['side' => 'black', 'chess_type' => 'knight', 'pokemon_name' => 'Mankey', 'pokemon_type' => 'fighting', 'sprite_url' => $this->spriteUrl(56)],
            ['side' => 'black', 'chess_type' => 'pawn', 'pokemon_name' => 'Meowth', 'pokemon_type' => 'normal', 'sprite_url' => $this->spriteUrl(52)],
        ];

        foreach ($pieces as $piece) {
            Piece::query()->updateOrCreate(
                ['side' => $piece['side'], 'chess_type' => $piece['chess_type']],
                $piece,
            );
        }
    }

    private function spriteUrl(int $pokemonId): string
    {
        return "/sprites/pokemon/{$pokemonId}.png";
    }
}
