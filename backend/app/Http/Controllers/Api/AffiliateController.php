<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Affiliate;
use App\Models\Boutique;
use Illuminate\Http\Request;

class AffiliateController extends Controller
{
    /**
     * Inscription publique à l'affiliation d'une boutique — accessible à tous,
     * avec ou sans compte CommandeCI. Si l'utilisateur est un vendeur connecté,
     * son compte est automatiquement rattaché.
     */
    public function inscrire(Request $request, string $slug)
    {
        $boutique = Boutique::where('slug', $slug)->where('est_active', true)->firstOrFail();

        $data = $request->validate([
            'nom' => ['required', 'string', 'max:100'],
            'telephone' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:150'],
        ]);

        $affilie = Affiliate::firstOrCreate(
            ['boutique_id' => $boutique->id, 'telephone' => $data['telephone']],
            [
                'nom' => $data['nom'],
                'email' => $data['email'] ?? null,
                'user_id' => $request->user('sanctum')?->id,
            ]
        );

        return response()->json([
            'affilie' => $affilie,
            'lien_affiliation' => $affilie->lienAffiliation(),
        ], 201);
    }

    /** Suivi d'un clic sur un lien d'affiliation (?ref=CODE), appelé au premier chargement de la vitrine. */
    public function suivreClic(Request $request, string $slug, string $code)
    {
        $affilie = Affiliate::whereHas('boutique', fn ($q) => $q->where('slug', $slug))
            ->where('code', strtoupper($code))
            ->first();

        if ($affilie) {
            $affilie->increment('nb_clics');
        }

        return response()->json(['ok' => true]);
    }

    /** Tableau de bord public de l'affilié — identifié par code + téléphone, pas de compte requis. */
    public function tableauDeBord(Request $request, string $code)
    {
        $data = $request->validate(['telephone' => ['required', 'string']]);

        $affilie = Affiliate::where('code', strtoupper($code))
            ->where('telephone', $data['telephone'])
            ->with('boutique')
            ->firstOrFail();

        return response()->json([
            'affilie' => $affilie,
            'lien_affiliation' => $affilie->lienAffiliation(),
            'commandes_generees' => $affilie->orders()
                ->where('statut', '!=', 'annulee')
                ->latest()
                ->limit(20)
                ->get(['id', 'numero', 'statut', 'total', 'montant_commission_affilie', 'created_at']),
        ]);
    }

    /** Liste des affiliés de la boutique du vendeur connecté. */
    public function index(Request $request)
    {
        $boutique = $request->user()->boutique()->firstOrFail();

        return response()->json($boutique->affiliates()->latest()->get());
    }

    public function basculerActivation(Request $request, Affiliate $affiliate)
    {
        abort_unless($affiliate->boutique->user_id === $request->user()->id, 403);
        $affiliate->update(['est_actif' => ! $affiliate->est_actif]);

        return response()->json($affiliate);
    }
}
