<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Boutique;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AdminStatController extends Controller
{
    /** Vue d'ensemble plateforme : croissance, revenus de commission par plan. */
    public function apercu()
    {
        return response()->json([
            'nombre_vendeurs' => User::where('role', 'vendeur')->count(),
            'nombre_boutiques' => Boutique::count(),
            'boutiques_premium' => Boutique::where('plan', 'premium')->count(),
            'nombre_commandes' => Order::count(),
            'commandes_livrees' => Order::where('statut', 'livree')->count(),
            'revenu_commission_total' => (float) Order::where('statut', 'livree')->sum('montant_commission'),
            'revenu_commission_par_pays' => Order::join('boutiques', 'orders.boutique_id', '=', 'boutiques.id')
                ->where('orders.statut', 'livree')
                ->select('boutiques.pays', DB::raw('SUM(orders.montant_commission) as total'))
                ->groupBy('boutiques.pays')
                ->orderByDesc('total')
                ->get(),
            'top_boutiques' => Boutique::withSum(['orders as ca' => fn ($q) => $q->where('statut', 'livree')], 'total')
                ->orderByDesc('ca')->limit(10)->get(['id', 'nom', 'plan', 'pays']),
        ]);
    }
}
