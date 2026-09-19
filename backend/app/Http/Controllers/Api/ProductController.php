<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $boutique = $request->user()->boutique()->firstOrFail();

        $produits = $boutique->products()
            ->with(['images', 'variants', 'category'])
            ->when($request->category_id, fn ($q) => $q->where('category_id', $request->category_id))
            ->when($request->recherche, fn ($q) => $q->where('nom', 'like', '%'.$request->recherche.'%'))
            ->latest()
            ->paginate(15);

        return response()->json($produits);
    }

    public function store(Request $request)
    {
        $boutique = $request->user()->boutique()->firstOrFail();

        $data = $request->validate([
            'category_id' => ['nullable', Rule::exists('categories', 'id')->where('boutique_id', $boutique->id)],
            'nom' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:2000'],
            'prix' => ['required', 'numeric', 'min:0'],
            'prix_promo' => ['nullable', 'numeric', 'min:0', 'lt:prix'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'suivi_stock' => ['nullable', 'boolean'],
            'est_publie' => ['nullable', 'boolean'],
            'images' => ['nullable', 'array', 'max:6'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:3072'],
            'variantes' => ['nullable', 'array'],
            'variantes.*.nom' => ['required_with:variantes', 'string', 'max:50'],
            'variantes.*.valeur' => ['required_with:variantes', 'string', 'max:50'],
            'variantes.*.supplement_prix' => ['nullable', 'numeric'],
            'variantes.*.stock' => ['nullable', 'integer', 'min:0'],

            // Produit numérique (ebook, pack de formation...)
            'type_produit' => ['nullable', 'in:physique,numerique'],
            'fichier_numerique' => ['nullable', 'file', 'mimes:pdf,zip,epub,mp4', 'max:512000'], // 500 Mo
            'livraison_numerique' => ['nullable', 'in:immediat,apres_confirmation'],

            // Affiliation
            'autoriser_affiliation' => ['nullable', 'boolean'],
            'taux_commission_affilie' => ['nullable', 'numeric', 'min:1', 'max:70'],
        ]);

        if (($data['type_produit'] ?? 'physique') === 'numerique') {
            $data['suivi_stock'] = false;
            $data['stock'] = 0;
        }

        $produit = $boutique->products()->create(
            collect($data)->except(['images', 'variantes', 'fichier_numerique'])->toArray()
        );

        if ($request->hasFile('fichier_numerique')) {
            $this->enregistrerFichierNumerique($request, $produit);
        }

        foreach ($request->file('images', []) as $index => $file) {
            $chemin = $file->store('produits', 'public');
            ProductImage::create([
                'product_id' => $produit->id,
                'chemin' => $chemin,
                'ordre' => $index,
                'est_principale' => $index === 0,
            ]);
        }

        foreach ($data['variantes'] ?? [] as $variante) {
            $produit->variants()->create($variante);
        }

        return response()->json($produit->load(['images', 'variants']), 201);
    }

    public function show(Request $request, Product $product)
    {
        $this->autoriserProprietaire($request, $product);

        return response()->json($product->load(['images', 'variants', 'category']));
    }

    public function update(Request $request, Product $product)
    {
        $this->autoriserProprietaire($request, $product);

        $data = $request->validate([
            'category_id' => ['nullable', Rule::exists('categories', 'id')->where('boutique_id', $product->boutique_id)],
            'nom' => ['sometimes', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:2000'],
            'prix' => ['sometimes', 'numeric', 'min:0'],
            'prix_promo' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'suivi_stock' => ['nullable', 'boolean'],
            'est_publie' => ['nullable', 'boolean'],
            'type_produit' => ['nullable', 'in:physique,numerique'],
            'fichier_numerique' => ['nullable', 'file', 'mimes:pdf,zip,epub,mp4', 'max:512000'],
            'livraison_numerique' => ['nullable', 'in:immediat,apres_confirmation'],
            'autoriser_affiliation' => ['nullable', 'boolean'],
            'taux_commission_affilie' => ['nullable', 'numeric', 'min:1', 'max:70'],
        ]);

        $product->update(collect($data)->except('fichier_numerique')->toArray());

        if ($request->hasFile('fichier_numerique')) {
            $this->enregistrerFichierNumerique($request, $product);
        }

        return response()->json($product->fresh()->load(['images', 'variants']));
    }

    public function destroy(Request $request, Product $product)
    {
        $this->autoriserProprietaire($request, $product);
        $product->delete();

        return response()->json(['message' => 'Produit supprimé.']);
    }

    private function autoriserProprietaire(Request $request, Product $product): void
    {
        abort_unless($product->boutique->user_id === $request->user()->id, 403, 'Accès non autorisé.');
    }

    /**
     * Stocke le fichier numérique (ebook, pack de formation...) sur le disque privé "local",
     * jamais exposé publiquement — seul un jeton de téléchargement généré à la commande
     * (voir AccesNumerique / DigitalDownloadController) permet d'y accéder.
     */
    private function enregistrerFichierNumerique(Request $request, Product $produit): void
    {
        $file = $request->file('fichier_numerique');
        $chemin = $file->store('numeriques/'.$produit->boutique_id, 'local');

        $produit->update([
            'fichier_numerique_path' => $chemin,
            'fichier_numerique_nom' => $file->getClientOriginalName(),
            'fichier_numerique_taille' => $file->getSize(),
        ]);
    }
}
