<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Un affilié fait la promotion des produits d'UNE boutique et touche une commission
        // sur chaque vente réalisée via son lien. Accessible sans compte CommandeCI (nom + téléphone),
        // ou automatiquement rattaché si la personne est déjà un vendeur connecté.
        Schema::create('affiliates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('boutique_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete()
                ->comment('Renseigné si l’affilié est aussi un vendeur CommandeCI connecté');
            $table->string('nom');
            $table->string('telephone');
            $table->string('email')->nullable();
            $table->string('code', 12)->unique();
            $table->unsignedInteger('nb_clics')->default(0);
            $table->unsignedInteger('nb_ventes')->default(0);
            $table->decimal('montant_commission_total', 12, 2)->default(0);
            $table->boolean('est_actif')->default(true);
            $table->timestamps();
        });

        // Jeton de téléchargement sécurisé généré pour chaque article numérique d'une commande.
        Schema::create('acces_numeriques', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_item_id')->constrained()->cascadeOnDelete();
            $table->string('token', 64)->unique();
            $table->unsignedInteger('nb_telechargements')->default(0);
            $table->unsignedInteger('limite_telechargements')->default(10);
            $table->boolean('debloque')->default(true)->comment('false si livraison_numerique = apres_confirmation, débloqué à la confirmation vendeur');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('acces_numeriques');
        Schema::dropIfExists('affiliates');
    }
};
