<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Observability\StoreAnalyticsEventsRequest;
use App\Models\AnalyticsEvent;
use Illuminate\Http\JsonResponse;

class ObservabilityController extends ApiController
{
    public function store(StoreAnalyticsEventsRequest $request): JsonResponse
    {
        $rows = collect($request->validated('events'))
            ->map(static fn (array $event): array => [
                'category' => $event['category'],
                'name' => $event['name'],
                'path' => $event['path'] ?? null,
                'value' => $event['value'] ?? null,
                'properties' => $event['properties'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ])
            ->all();

        AnalyticsEvent::query()->insert($rows);

        return response()->json(['message' => 'Eventos registrados.'], 201);
    }
}
