<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Admin\StorePieceRequest;
use App\Http\Requests\Admin\UpdatePieceRequest;
use App\Http\Resources\PieceResource;
use App\Models\Piece;
use Illuminate\Http\JsonResponse;
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

    public function store(StorePieceRequest $request): JsonResponse
    {
        $piece = Piece::query()->create($request->validated());

        return response()->json([
            'piece' => new PieceResource($piece),
        ], 201);
    }

    public function show(Piece $piece): PieceResource
    {
        return new PieceResource($piece);
    }

    public function update(UpdatePieceRequest $request, Piece $piece): JsonResponse
    {
        $piece->update($request->validated());

        return response()->json([
            'piece' => new PieceResource($piece->fresh()),
        ]);
    }

    public function destroy(Piece $piece): JsonResponse
    {
        $piece->delete();

        return response()->json(['message' => 'Pieza eliminada.']);
    }
}
