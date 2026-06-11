<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\PieceResource;
use App\Models\Piece;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PieceController extends ApiController
{
    public function index(): AnonymousResourceCollection
    {
        $pieces = Piece::query()
            ->orderBy('side')
            ->orderBy('chess_type')
            ->get();

        return PieceResource::collection($pieces);
    }
}
