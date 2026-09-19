<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone')->unique()->comment('Format E.164, ex: +2250700000000');
            $table->string('email')->nullable()->unique();
            $table->string('password');
            $table->enum('role', ['vendeur', 'admin'])->default('vendeur');
            $table->string('country', 2)->default('CI')->comment('Code pays ISO, ex: CI, SN, CM...');
            $table->timestamp('phone_verified_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
