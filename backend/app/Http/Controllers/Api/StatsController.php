<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Stats\RecordGameResultRequest;
use App\Http\Resources\GameStatResource;
use App\Models\GameStat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatsController extends ApiController
{
    public function show(Request $request): JsonResponse
    {
        $stats = $this->resolveStats($request);

        return response()->json([
            'stats' => new GameStatResource($stats),
        ]);
    }

    public function record(RecordGameResultRequest $request): JsonResponse
    {
        $stats = $this->resolveStats($request);

        match ($request->string('result')->toString()) {
            'win' => $stats->increment('wins'),
            'loss' => $stats->increment('losses'),
            'draw' => $stats->increment('draws'),
        };

        return response()->json([
            'stats' => new GameStatResource($stats->fresh()),
        ]);
    }

    private function resolveStats(Request $request): GameStat
    {
        $user = $request->user();

        return $user->gameStat ?? GameStat::query()->create([
            'user_id' => $user->id,
            'wins' => 0,
            'losses' => 0,
            'draws' => 0,
        ]);
    }
}
