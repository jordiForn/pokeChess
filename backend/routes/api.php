<?php

use App\Http\Controllers\Api\Admin\PieceController as AdminPieceController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PieceController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\StatsController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/pieces', [PieceController::class, 'index']);

    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'me']);
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::get('/stats', [StatsController::class, 'show']);
        Route::post('/stats/record', [StatsController::class, 'record']);
    });

    Route::middleware(['auth:sanctum', 'is_admin'])->prefix('admin')->group(function (): void {
        Route::apiResource('users', AdminUserController::class);
        Route::apiResource('pieces', AdminPieceController::class);
    });
});
