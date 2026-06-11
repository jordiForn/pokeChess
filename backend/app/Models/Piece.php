<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Piece extends Model
{
    protected $fillable = [
        'side',
        'chess_type',
        'pokemon_name',
        'pokemon_type',
        'sprite_url',
    ];
}
