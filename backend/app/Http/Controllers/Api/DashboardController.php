<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $boutique = $request->user()->boutique()->firstOrFail();
        $periode = $request->query('periode', '30j'); // 7j | 30j | 12m
        $depuis = match ($periode) {
            '7j' => now()->subDays(7),
            '12m' => now()->subMonths(12),
            default => now()->subDays(30),
        };

        $commandes = $boutique->orders()->where('created_at', '>=', $depuis);

        $ventesLivrees = (clone $commandes)->where('statut', 'livree');

        return response()->json([
            'plan' => $boutique->plan,
            'taux_commission_actuel' => $boutique->tauxCommissionActuel(),
            'chiffre_affaires' => (float) (clone $ventesLivrees)->sum('total'),
            'commission_totale' => (float) (clone $ventesLivrees)->sum('montant_commission'),
            'commission_affilies_totale' => (float) (clone $ventesLivrees)->sum('montant_commission_affilie'),
            'nombre_commandes' => (clone $commandes)->count(),
            'nombre_livrees' => (clone $ventesLivrees)->count(),
            'nombre_annulees' => (clone $commandes)->where('statut', 'annulee')->count(),
            'panier_moyen' => round((float) (clone $ventesLivrees)->avg('total'), 2),
            'repartition_statuts' => (clone $commandes)
                ->select('statut', DB::raw('count(*) as total'))
                ->groupBy('statut')->pluck('total', 'statut'),
            'ventes_par_jour' => (clone $ventesLivrees)
                ->select(DB::raw('DATE(created_at) as jour'), DB::raw('SUM(total) as total'))
                ->groupBy('jour')->orderBy('jour')->get(),
            'produits_populaires' => $boutique->products()
                ->orderByDesc('nb_ventes')->limit(5)
                ->get(['id', 'nom', 'nb_ventes', 'prix']),
            'nouveaux_clients' => $boutique->customers()->where('created_at', '>=', $depuis)->count(),
        ]);
    }
}
