<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Type de produit : physique (livré) ou numérique (ebook, pack de formation...)
            $table->enum('type_produit', ['physique', 'numerique'])->default('physique')->after('slug');
            $table->string('fichier_numerique_path')->nullable()->after('type_produit');
            $table->string('fichier_numerique_nom')->nullable()->after('fichier_numerique_path');
            $table->unsignedBigInteger('fichier_numerique_taille')->nullable()->after('fichier_numerique_nom');

            // Quand l'accès au fichier est débloqué pour le client :
            // "immediat" = dès la commande (paiement en ligne simulé/à brancher sur Wave),
            // "apres_confirmation" = seulement quand le vendeur confirme la commande manuellement.
            $table->enum('livraison_numerique', ['immediat', 'apres_confirmation'])->default('immediat')->after('fichier_numerique_taille');

            // Affiliation
            $table->boolean('autoriser_affiliation')->default(false)->after('livraison_numerique');
            $table->decimal('taux_commission_affilie', 4, 2)->nullable()->after('autoriser_affiliation')
                ->comment('Pourcentage du prix reversé à l’affilié qui a généré la vente');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('affiliate_id')->nullable()->after('customer_id')->constrained('affiliates')->nullOnDelete();
            $table->string('code_affilie_utilise')->nullable()->after('affiliate_id');
            $table->decimal('montant_commission_affilie', 12, 2)->default(0)->after('montant_commission');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->decimal('taux_commission_affilie_applique', 4, 2)->nullable()->after('total_ligne');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->string('email')->nullable()->after('telephone');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn('email');
        });
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('taux_commission_affilie_applique');
        });
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('affiliate_id');
            $table->dropColumn(['code_affilie_utilise', 'montant_commission_affilie']);
        });
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'type_produit', 'fichier_numerique_path', 'fichier_numerique_nom',
                'fichier_numerique_taille', 'livraison_numerique',
                'autoriser_affiliation', 'taux_commission_affilie',
            ]);
        });
    }
};
