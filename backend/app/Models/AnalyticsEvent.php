<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnalyticsEvent extends Model
{
    protected $fillable = [
        'category',
        'name',
        'path',
        'value',
        'properties',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'float',
            'properties' => 'array',
        ];
    }
}
