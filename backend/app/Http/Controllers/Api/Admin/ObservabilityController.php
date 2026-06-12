<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\AnalyticsEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ObservabilityController extends ApiController
{
    public function summary(Request $request): JsonResponse
    {
        $days = min(max((int) $request->integer('days', 7), 1), 90);
        $since = Carbon::now()->subDays($days);

        $events = AnalyticsEvent::query()
            ->where('created_at', '>=', $since)
            ->get(['category', 'name', 'path', 'value']);

        $pageViews = $events->where('category', 'page_view')->count();

        $topPaths = $events
            ->where('category', 'page_view')
            ->filter(static fn ($event) => filled($event->path))
            ->groupBy('path')
            ->map(static fn ($group) => $group->count())
            ->sortDesc()
            ->take(8)
            ->map(static fn (int $count, string $path) => ['path' => $path, 'count' => $count])
            ->values();

        $customEvents = $events
            ->where('category', 'event')
            ->groupBy('name')
            ->map(static fn ($group) => $group->count())
            ->sortDesc()
            ->take(8)
            ->map(static fn (int $count, string $name) => ['name' => $name, 'count' => $count])
            ->values();

        $webVitals = collect(['LCP', 'INP', 'CLS'])
            ->mapWithKeys(function (string $metric) use ($events) {
                $values = $events
                    ->where('category', 'web_vital')
                    ->where('name', $metric)
                    ->pluck('value')
                    ->filter(static fn ($value) => $value !== null)
                    ->sort()
                    ->values();

                if ($values->isEmpty()) {
                    return [$metric => null];
                }

                $index = (int) floor(($values->count() - 1) * 0.75);

                return [$metric => [
                    'p75' => round((float) $values[$index], 3),
                    'samples' => $values->count(),
                ]];
            });

        return response()->json([
            'period_days' => $days,
            'page_views' => $pageViews,
            'top_paths' => $topPaths,
            'custom_events' => $customEvents,
            'web_vitals' => $webVitals,
            'vercel_dashboard' => [
                'analytics_url' => config('services.vercel.analytics_url'),
                'speed_insights_url' => config('services.vercel.speed_insights_url'),
            ],
        ]);
    }
}
