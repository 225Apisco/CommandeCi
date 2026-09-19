<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Boutique;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BoutiqueController extends Controller
{
    /** Création de la boutique du vendeur connecté (une seule boutique par vendeur). */
    public function store(Request $request)
    {
        if ($request->user()->boutique) {
            return response()->json(['message' => 'Vous avez déjà une boutique.'], 422);
        }

        $data = $request->validate([
            'nom' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
            'whatsapp_numero' => ['required', 'string', 'max:20'],
            'ville' => ['nullable', 'string', 'max:100'],
            'pays' => ['nullable', 'string', 'size:2'],
            'devise' => ['nullable', 'string', 'size:3'],
            'couleur_theme' => ['nullable', 'string', 'max:7'],
        ]);

        $boutique = Boutique::create([
            ...$data,
            'user_id' => $request->user()->id,
            'pays' => $data['pays'] ?? $request->user()->country,
            'devise' => $data['devise'] ?? 'XOF',
            'taux_commission' => (float) config('commandeci.commission_rate_standard', 1),
        ]);

        return response()->json($boutique, 201);
    }

    public function update(Request $request)
    {
        $boutique = $request->user()->boutique()->firstOrFail();

        $data = $request->validate([
            'nom' => ['sometimes', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
            'whatsapp_numero' => ['sometimes', 'string', 'max:20'],
            'ville' => ['nullable', 'string', 'max:100'],
            'couleur_theme' => ['nullable', 'string', 'max:7'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'banniere' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);

        if ($request->hasFile('logo')) {
            $data['logo_path'] = $request->file('logo')->store('boutiques/logos', 'public');
        }
        if ($request->hasFile('banniere')) {
            $data['banniere_path'] = $request->file('banniere')->store('boutiques/bannieres', 'public');
        }

        $boutique->update(collect($data)->except(['logo', 'banniere'])->toArray());

        return response()->json($boutique);
    }

    public function moi(Request $request)
    {
        return response()->json($request->user()->boutique()->firstOrFail());
    }

    /**
     * Vitrine publique — accessible sans authentification, via le slug de la boutique.
     * Utilisée pour le lien direct partagé sur WhatsApp/Facebook/Instagram.
     */
    public function vitrine(string $slug)
    {
        $boutique = Boutique::where('slug', $slug)
            ->where('est_active', true)
            ->with(['categories' => fn ($q) => $q->orderBy('ordre')])
            ->firstOrFail();

        $produits = $boutique->products()
            ->where('est_publie', true)
            ->with(['images', 'variants'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'boutique' => $boutique,
            'produits' => $produits,
        ]);
    }
}
