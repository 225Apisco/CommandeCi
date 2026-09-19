<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;

/**
 * Couche de paiement générique.
 *
 * Le MVP fonctionne en "paiement à la livraison" par défaut. Cette couche est prête
 * à recevoir un vrai fournisseur (Wave, Orange Money, MTN MoMo...) sans changer le
 * schéma de données : il suffira d'implémenter un client HTTP par fournisseur et de
 * brancher son webhook sur la méthode `webhook()` ci-dessous.
 */
class PaymentController extends Controller
{
    public const FOURNISSEURS_ACTIFS = ['especes_livraison']; // 'wave' à activer après validation Wave Business

    public function initier(Request $request, Order $order)
    {
        $data = $request->validate([
            'fournisseur' => ['required', 'in:'.implode(',', ['especes_livraison', 'wave', 'orange_money', 'mtn_momo'])],
        ]);

        if (! in_array($data['fournisseur'], self::FOURNISSEURS_ACTIFS, true)) {
            return response()->json([
                'message' => 'Ce moyen de paiement arrive bientôt. Utilisez le paiement à la livraison pour l’instant.',
            ], 422);
        }

        $payment = Payment::create([
            'order_id' => $order->id,
            'fournisseur' => $data['fournisseur'],
            'montant' => $order->total,
            'statut' => $data['fournisseur'] === 'especes_livraison' ? 'reussi' : 'initie',
        ]);

        if ($payment->statut === 'reussi') {
            $order->update(['statut_paiement' => 'paye']);
        }

        return response()->json($payment, 201);
    }

    /** Point d'entrée générique pour les webhooks des futurs fournisseurs de paiement. */
    public function webhook(Request $request, string $fournisseur)
    {
        // À implémenter par fournisseur : vérification de signature, mapping du statut,
        // puis mise à jour de Payment + Order::statut_paiement.
        return response()->json(['message' => "Webhook {$fournisseur} reçu."]);
    }
}
