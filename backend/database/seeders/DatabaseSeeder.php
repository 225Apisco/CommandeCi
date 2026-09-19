<?php

namespace Database\Seeders;

use App\Models\Affiliate;
use App\Models\Boutique;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Compte admin plateforme
        User::create([
            'name' => 'Admin CommandeCI',
            'phone' => '+2250700000001',
            'email' => 'admin@commandeci.africa',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'country' => 'CI',
        ]);

        // Vendeur de démo — boutique Premium (commission 2%)
        $vendeur = User::create([
            'name' => 'Aïcha Koné',
            'phone' => '+2250700000002',
            'email' => 'aicha@example.com',
            'password' => Hash::make('password'),
            'role' => 'vendeur',
            'country' => 'CI',
        ]);

        $boutique = Boutique::create([
            'user_id' => $vendeur->id,
            'nom' => 'Aïcha Mode & Beauté',
            'description' => 'Vêtements, cosmétiques et accessoires livrés partout à Abidjan.',
            'whatsapp_numero' => '+2250700000002',
            'ville' => 'Abidjan',
            'pays' => 'CI',
            'devise' => 'XOF',
            'couleur_theme' => '#FF8A1E',
            'plan' => 'premium',
            'taux_commission' => 2.00,
            'est_verifiee' => true,
        ]);

        $categorie = Category::create(['boutique_id' => $boutique->id, 'nom' => 'Robes', 'ordre' => 1]);

        Product::create([
            'boutique_id' => $boutique->id,
            'category_id' => $categorie->id,
            'nom' => 'Robe Ankara Élégance',
            'description' => 'Robe en tissu wax, coupe cintrée, disponible en plusieurs tailles.',
            'prix' => 25000,
            'prix_promo' => 19900,
            'stock' => 12,
            'est_publie' => true,
            'autoriser_affiliation' => true,
            'taux_commission_affilie' => 15,
        ]);

        $categorieFormation = Category::create(['boutique_id' => $boutique->id, 'nom' => 'Formations', 'ordre' => 2]);

        Product::create([
            'boutique_id' => $boutique->id,
            'category_id' => $categorieFormation->id,
            'nom' => 'Pack Formation : Vendre sur WhatsApp',
            'description' => 'Ebook + 3 vidéos pour structurer vos ventes WhatsApp de A à Z.',
            'prix' => 15000,
            'stock' => 0,
            'suivi_stock' => false,
            'est_publie' => true,
            'type_produit' => 'numerique',
            'livraison_numerique' => 'immediat',
            'autoriser_affiliation' => true,
            'taux_commission_affilie' => 30,
        ]);

        // Affilié de démo pour la boutique premium
        Affiliate::create([
            'boutique_id' => $boutique->id,
            'nom' => 'Fatou Diabaté',
            'telephone' => '+2250700000099',
            'code' => 'FATOU30',
            'est_actif' => true,
        ]);

        // Vendeur standard — commission 1%
        $vendeur2 = User::create([
            'name' => 'Yao Kouassi',
            'phone' => '+2250700000003',
            'password' => Hash::make('password'),
            'role' => 'vendeur',
            'country' => 'CI',
        ]);

        Boutique::create([
            'user_id' => $vendeur2->id,
            'nom' => 'Kouassi Électro',
            'description' => 'Téléphones, accessoires et petit électroménager.',
            'whatsapp_numero' => '+2250700000003',
            'ville' => 'Bouaké',
            'pays' => 'CI',
            'devise' => 'XOF',
            'plan' => 'standard',
            'taux_commission' => 1.00,
        ]);
    }
}
