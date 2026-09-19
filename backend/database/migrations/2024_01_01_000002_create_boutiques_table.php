<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('boutiques', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('nom');
            $table->string('slug')->unique()->comment('Utilisé dans l’URL publique: commandeci.com/b/{slug}');
            $table->string('logo_path')->nullable();
            $table->string('banniere_path')->nullable();
            $table->text('description')->nullable();
            $table->string('whatsapp_numero')->comment('Numéro WhatsApp Business affiché aux clients');
            $table->string('ville')->nullable();
            $table->string('pays', 2)->default('CI');
            $table->string('devise', 3)->default('XOF');
            $table->string('couleur_theme', 7)->default('#FF8A1E');

            // Plan & commission — logique "1% standard / 2% Premium partout en Afrique"
            $table->enum('plan', ['standard', 'premium'])->default('standard');
            $table->decimal('taux_commission', 4, 2)->default(1.00)->comment('Pourcentage prélevé sur chaque vente livrée');
            $table->timestamp('premium_expire_le')->nullable();

            $table->boolean('est_active')->default(true);
            $table->boolean('est_verifiee')->default(false);
            $table->unsignedInteger('nb_signalements')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('boutiques');
    }
};
