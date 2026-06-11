<?php

namespace Database\Seeders;

use App\Models\GameStat;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call(PieceSeeder::class);

        $admin = User::query()->updateOrCreate(
            ['email' => 'admin@pokechess.test'],
            [
                'name' => 'Admin',
                'password' => 'password',
                'role' => 'admin',
                'avatar' => null,
            ],
        );

        GameStat::query()->updateOrCreate(
            ['user_id' => $admin->id],
            ['wins' => 0, 'losses' => 0, 'draws' => 0],
        );

        $user = User::query()->updateOrCreate(
            ['email' => 'user@pokechess.test'],
            [
                'name' => 'Test User',
                'password' => 'password',
                'role' => 'user',
                'avatar' => null,
            ],
        );

        GameStat::query()->updateOrCreate(
            ['user_id' => $user->id],
            ['wins' => 0, 'losses' => 0, 'draws' => 0],
        );
    }
}
