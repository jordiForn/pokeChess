<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analytics_events', function (Blueprint $table) {
            $table->id();
            $table->string('category', 32);
            $table->string('name', 64);
            $table->string('path', 255)->nullable();
            $table->decimal('value', 12, 4)->nullable();
            $table->json('properties')->nullable();
            $table->timestamps();

            $table->index(['category', 'created_at']);
            $table->index(['name', 'created_at']);
            $table->index(['path', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_events');
    }
};
