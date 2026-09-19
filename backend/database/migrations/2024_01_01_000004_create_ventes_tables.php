<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Client final — pas de compte obligatoire, identifié par téléphone + boutique
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('boutique_id')->constrained()->cascadeOnDelete();
            $table->string('nom');
            $table->string('telephone');
            $table->string('adresse')->nullable();
            $table->string('ville')->nullable();
            $table->string('quartier')->nullable();
            $table->text('note_livraison')->nullable();
            $table->timestamps();
            $table->unique(['boutique_id', 'telephone']);
        });

        // Panier — identifié par un jeton stocké côté client (cookie/localStorage), pas de compte requis
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('boutique_id')->constrained()->cascadeOnDelete();
            $table->string('token')->unique();
            $table->timestamps();
        });

        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained('product_variants')->nullOnDelete();
            $table->unsignedInteger('quantite')->default(1);
            $table->timestamps();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('boutique_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->string('numero')->unique()->comment('Référence lisible, ex: CCI-2026-000123');
            $table->enum('statut', [
                'nouvelle', 'confirmee', 'preparation', 'expediee', 'livree', 'annulee',
            ])->default('nouvelle');
            $table->decimal('sous_total', 12, 2);
            $table->decimal('frais_livraison', 12, 2)->default(0);
            $table->decimal('total', 12, 2);

            // Commission CommandeCI — figée au moment de la commande
            $table->decimal('taux_commission_applique', 4, 2)->default(1.00);
            $table->decimal('montant_commission', 12, 2)->default(0);

            $table->string('adresse_livraison');
            $table->string('ville_livraison')->nullable();
            $table->text('note_client')->nullable();
            $table->string('canal_origine')->nullable()->comment('whatsapp | facebook | instagram | lien_direct');
            $table->enum('statut_paiement', ['en_attente', 'paye', 'echoue', 'rembourse'])->default('en_attente');
            $table->timestamp('confirmee_le')->nullable();
            $table->timestamp('livree_le')->nullable();
            $table->timestamp('annulee_le')->nullable();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained('product_variants')->nullOnDelete();
            $table->string('nom_produit')->comment('Copie figée au moment de la commande');
            $table->decimal('prix_unitaire', 12, 2);
            $table->unsignedInteger('quantite');
            $table->decimal('total_ligne', 12, 2);
            $table->timestamps();
        });

        // Couche de paiement — prête pour Wave et autres, activable sans changer le schéma
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('fournisseur')->comment('wave | orange_money | mtn_momo | especes_livraison');
            $table->string('reference_externe')->nullable();
            $table->decimal('montant', 12, 2);
            $table->enum('statut', ['initie', 'reussi', 'echoue', 'annule'])->default('initie');
            $table->json('donnees_brutes')->nullable();
            $table->timestamps();
        });

        Schema::create('notifications_vendeur', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type')->comment('nouvelle_commande | commande_annulee | stock_faible | signalement');
            $table->string('titre');
            $table->text('message');
            $table->json('donnees')->nullable();
            $table->timestamp('lue_le')->nullable();
            $table->timestamps();
        });

        Schema::create('signalements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('boutique_id')->constrained()->cascadeOnDelete();
            $table->string('raison');
            $table->text('details')->nullable();
            $table->string('signale_par')->nullable();
            $table->enum('statut', ['ouvert', 'en_cours', 'resolu', 'rejete'])->default('ouvert');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('signalements');
        Schema::dropIfExists('notifications_vendeur');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
        Schema::dropIfExists('customers');
    }
};
