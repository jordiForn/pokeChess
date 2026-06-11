<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pieces', function (Blueprint $table) {
            $table->id();
            $table->string('side');
            $table->string('chess_type');
            $table->string('pokemon_name');
            $table->string('pokemon_type');
            $table->string('sprite_url');
            $table->timestamps();

            $table->unique(['side', 'chess_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pieces');
    }
};
