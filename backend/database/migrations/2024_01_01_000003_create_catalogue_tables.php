<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('boutique_id')->constrained()->cascadeOnDelete();
            $table->string('nom');
            $table->string('slug');
            $table->unsignedInteger('ordre')->default(0);
            $table->timestamps();
            $table->unique(['boutique_id', 'slug']);
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('boutique_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('nom');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->decimal('prix', 12, 2);
            $table->decimal('prix_promo', 12, 2)->nullable();
            $table->unsignedInteger('stock')->default(0);
            $table->boolean('suivi_stock')->default(true);
            $table->boolean('est_publie')->default(true);
            $table->unsignedInteger('nb_vues')->default(0);
            $table->unsignedInteger('nb_ventes')->default(0);
            $table->timestamps();
            $table->unique(['boutique_id', 'slug']);
        });

        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('nom')->comment('Ex: Taille, Couleur');
            $table->string('valeur')->comment('Ex: XL, Rouge');
            $table->decimal('supplement_prix', 12, 2)->default(0);
            $table->unsignedInteger('stock')->default(0);
            $table->string('sku')->nullable();
            $table->timestamps();
        });

        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('chemin');
            $table->unsignedInteger('ordre')->default(0);
            $table->boolean('est_principale')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
    }
};
