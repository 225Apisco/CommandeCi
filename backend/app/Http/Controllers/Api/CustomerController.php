<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $boutique = $request->user()->boutique()->firstOrFail();

        $clients = $boutique->customers()
            ->withCount('orders')
            ->when($request->recherche, fn ($q) => $q->where('nom', 'like', '%'.$request->recherche.'%')
                ->orWhere('telephone', 'like', '%'.$request->recherche.'%'))
            ->latest()
            ->paginate(20);

        return response()->json($clients);
    }

    public function show(Request $request, int $id)
    {
        $boutique = $request->user()->boutique()->firstOrFail();
        $client = $boutique->customers()->with(['orders.items'])->findOrFail($id);

        return response()->json([
            'client' => $client,
            'nombre_commandes' => $client->nombreCommandes(),
            'total_depense' => $client->totalDepense(),
        ]);
    }
}
