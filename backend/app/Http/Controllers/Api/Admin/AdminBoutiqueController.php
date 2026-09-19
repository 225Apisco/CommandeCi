<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Boutique;
use Illuminate\Http\Request;

class AdminBoutiqueController extends Controller
{
    public function index(Request $request)
    {
        $boutiques = Boutique::with('user')
            ->withCount(['orders', 'products'])
            ->when($request->plan, fn ($q) => $q->where('plan', $request->plan))
            ->when($request->recherche, fn ($q) => $q->where('nom', 'like', '%'.$request->recherche.'%'))
            ->latest()
            ->paginate(20);

        return response()->json($boutiques);
    }

    /** Passage manuel d'une boutique en Premium (le taux de commission passe de 1% à 2%). */
    public function definirPlan(Request $request, Boutique $boutique)
    {
        $data = $request->validate([
            'plan' => ['required', 'in:standard,premium'],
            'expire_le' => ['nullable', 'date'],
        ]);

        $tauxCle = $data['plan'] === 'premium' ? 'commission_rate_premium' : 'commission_rate_standard';

        $boutique->update([
            'plan' => $data['plan'],
            'premium_expire_le' => $data['expire_le'] ?? null,
            'taux_commission' => (float) config("commandeci.{$tauxCle}"),
        ]);

        return response()->json($boutique);
    }

    public function suspendre(Request $request, Boutique $boutique)
    {
        $boutique->update(['est_active' => false]);

        return response()->json($boutique);
    }

    public function reactiver(Request $request, Boutique $boutique)
    {
        $boutique->update(['est_active' => true]);

        return response()->json($boutique);
    }
}
