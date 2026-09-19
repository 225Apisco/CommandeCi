<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    /**
     * Retourne les données structurées de la facture/reçu.
     * Le rendu PDF/impression est fait côté frontend (composant Facture imprimable),
     * ce qui évite une dépendance PDF lourde côté serveur pour ce MVP.
     */
    public function show(Request $request, Order $order)
    {
        abort_unless($order->boutique->user_id === $request->user()->id, 403);

        $order->load('items', 'customer', 'boutique');

        return response()->json([
            'numero' => $order->numero,
            'date' => $order->created_at->format('d/m/Y H:i'),
            'boutique' => [
                'nom' => $order->boutique->nom,
                'whatsapp' => $order->boutique->whatsapp_numero,
                'ville' => $order->boutique->ville,
            ],
            'client' => [
                'nom' => $order->customer->nom,
                'telephone' => $order->customer->telephone,
                'adresse' => $order->adresse_livraison,
            ],
            'lignes' => $order->items,
            'sous_total' => $order->sous_total,
            'frais_livraison' => $order->frais_livraison,
            'total' => $order->total,
            'devise' => $order->boutique->devise,
            'statut' => $order->statut,
        ]);
    }
}
