<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccesNumerique;
use App\Models\Affiliate;
use App\Models\Boutique;
use App\Models\Cart;
use App\Models\NotificationVendeur;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Passage de commande public — le client fournit juste ses coordonnées
     * et son adresse de livraison, aucun compte requis.
     */
    public function passerCommande(Request $request, string $slug)
    {
        $boutique = Boutique::where('slug', $slug)->where('est_active', true)->firstOrFail();

        $cart = Cart::where('boutique_id', $boutique->id)
            ->where('token', $request->input('token'))
            ->with('items.product', 'items.variant')
            ->firstOrFail();

        if ($cart->items->isEmpty()) {
            return response()->json(['message' => 'Le panier est vide.'], 422);
        }

        // La livraison n'est requise que si le panier contient au moins un produit physique.
        $contientPhysique = $cart->items->contains(fn ($item) => ! $item->product->estNumerique());

        $data = $request->validate([
            'token' => ['required', 'string'],
            'nom' => ['required', 'string', 'max:100'],
            'telephone' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:150'],
            'adresse_livraison' => [$contientPhysique ? 'required' : 'nullable', 'string', 'max:255'],
            'ville_livraison' => ['nullable', 'string', 'max:100'],
            'note_client' => ['nullable', 'string', 'max:500'],
            'canal_origine' => ['nullable', 'in:whatsapp,facebook,instagram,lien_direct'],
            'frais_livraison' => ['nullable', 'numeric', 'min:0'],
            'code_affilie' => ['nullable', 'string', 'max:12'],
        ]);

        $order = DB::transaction(function () use ($boutique, $data, $cart, $contientPhysique) {
            $client = $boutique->customers()->firstOrCreate(
                ['telephone' => $data['telephone']],
                [
                    'nom' => $data['nom'], 'email' => $data['email'] ?? null,
                    'adresse' => $data['adresse_livraison'] ?? null, 'ville' => $data['ville_livraison'] ?? null,
                ]
            );

            $affilie = null;
            if (! empty($data['code_affilie'])) {
                $affilie = Affiliate::where('boutique_id', $boutique->id)
                    ->where('code', strtoupper($data['code_affilie']))
                    ->where('est_actif', true)
                    ->first();
            }

            $sousTotal = 0;
            $lignesCalculees = [];
            foreach ($cart->items as $item) {
                if (! $item->product->estNumerique() && $item->product->suivi_stock && $item->product->stock < $item->quantite) {
                    abort(422, "Stock insuffisant pour « {$item->product->nom} ».");
                }
                $prixUnite = $item->product->prixAffiche() + ($item->variant?->supplement_prix ?? 0);
                $totalLigne = $prixUnite * $item->quantite;
                $sousTotal += $totalLigne;
                $lignesCalculees[] = compact('item', 'prixUnite', 'totalLigne');
            }

            $fraisLivraison = $contientPhysique ? ($data['frais_livraison'] ?? 0) : 0;
            $total = $sousTotal + $fraisLivraison;

            // Commission CommandeCI figée au moment de la commande : 1% standard, 2% Premium.
            $tauxCommission = $boutique->tauxCommissionActuel();
            $montantCommission = round($total * $tauxCommission / 100, 2);

            // Commission d'affiliation : calculée produit par produit (chaque produit a son propre taux).
            $montantCommissionAffilie = 0;
            if ($affilie) {
                foreach ($lignesCalculees as $ligne) {
                    if ($ligne['item']->product->autoriser_affiliation) {
                        $tauxLigne = (float) $ligne['item']->product->taux_commission_affilie;
                        $montantCommissionAffilie += round($ligne['totalLigne'] * $tauxLigne / 100, 2);
                    }
                }
            }

            $order = Order::create([
                'boutique_id' => $boutique->id,
                'customer_id' => $client->id,
                'affiliate_id' => $affilie?->id,
                'code_affilie_utilise' => $affilie?->code,
                'statut' => 'nouvelle',
                'sous_total' => $sousTotal,
                'frais_livraison' => $fraisLivraison,
                'total' => $total,
                'taux_commission_applique' => $tauxCommission,
                'montant_commission' => $montantCommission,
                'montant_commission_affilie' => $montantCommissionAffilie,
                'adresse_livraison' => $data['adresse_livraison'] ?? 'Livraison numérique — aucune adresse requise',
                'ville_livraison' => $data['ville_livraison'] ?? null,
                'note_client' => $data['note_client'] ?? null,
                'canal_origine' => $data['canal_origine'] ?? 'lien_direct',
            ]);

            foreach ($lignesCalculees as $ligne) {
                $item = $ligne['item'];
                $orderItem = $order->items()->create([
                    'product_id' => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                    'nom_produit' => $item->product->nom.($item->variant ? " ({$item->variant->valeur})" : ''),
                    'prix_unitaire' => $ligne['prixUnite'],
                    'quantite' => $item->quantite,
                    'total_ligne' => $ligne['totalLigne'],
                    'taux_commission_affilie_applique' => $item->product->autoriser_affiliation
                        ? $item->product->taux_commission_affilie : null,
                ]);

                if ($item->product->estNumerique()) {
                    // Génère un jeton de téléchargement sécurisé pour chaque article numérique.
                    AccesNumerique::create([
                        'order_item_id' => $orderItem->id,
                        'debloque' => $item->product->livraison_numerique === 'immediat',
                    ]);
                } else {
                    if ($item->product->suivi_stock) {
                        $item->product->decrement('stock', $item->quantite);
                    }
                }
                $item->product->increment('nb_ventes', $item->quantite);
            }

            if ($affilie) {
                $affilie->increment('nb_ventes');
                $affilie->increment('montant_commission_total', $montantCommissionAffilie);
            }

            $cart->items()->delete();

            NotificationVendeur::create([
                'user_id' => $boutique->user_id,
                'type' => 'nouvelle_commande',
                'titre' => 'Nouvelle commande reçue',
                'message' => "Commande {$order->numero} de {$client->nom} — {$total} {$boutique->devise}",
                'donnees' => ['order_id' => $order->id],
            ]);

            return $order;
        });

        return response()->json($order->load('items.accesNumerique', 'customer'), 201);
    }

    /** Suivi public d'une commande via son numéro + téléphone (pas de compte requis). */
    public function suivre(Request $request, string $numero)
    {
        $data = $request->validate(['telephone' => ['required', 'string']]);

        $order = Order::where('numero', $numero)
            ->whereHas('customer', fn ($q) => $q->where('telephone', $data['telephone']))
            ->with('items.accesNumerique', 'items.product', 'boutique')
            ->firstOrFail();

        return response()->json($order);
    }

    /** Liste des commandes du vendeur connecté, avec filtres par statut. */
    public function index(Request $request)
    {
        $boutique = $request->user()->boutique()->firstOrFail();

        $orders = $boutique->orders()
            ->with(['customer', 'items'])
            ->when($request->statut, fn ($q) => $q->where('statut', $request->statut))
            ->latest()
            ->paginate(15);

        return response()->json($orders);
    }

    public function show(Request $request, Order $order)
    {
        $this->autoriser($request, $order);

        return response()->json($order->load('items', 'customer', 'payments'));
    }

    /** Changement de statut respectant le flux : nouvelle → confirmée → préparation → expédiée → livrée (ou annulée). */
    public function changerStatut(Request $request, Order $order)
    {
        $this->autoriser($request, $order);

        $data = $request->validate(['statut' => ['required', 'in:'.implode(',', Order::STATUTS)]]);

        if (! $order->changerStatut($data['statut'])) {
            return response()->json([
                'message' => "Transition invalide de « {$order->statut} » vers « {$data['statut']} ».",
            ], 422);
        }

        // Débloque les fichiers numériques dont la livraison attendait la confirmation vendeur.
        if ($data['statut'] === 'confirmee') {
            foreach ($order->items()->with('product', 'accesNumerique')->get() as $item) {
                if ($item->product?->estNumerique() && $item->accesNumerique && ! $item->accesNumerique->debloque) {
                    $item->accesNumerique->update(['debloque' => true]);
                }
            }
        }

        NotificationVendeur::create([
            'user_id' => $order->boutique->user_id,
            'type' => $data['statut'] === 'annulee' ? 'commande_annulee' : 'maj_commande',
            'titre' => "Commande {$order->numero} — {$data['statut']}",
            'message' => "Le statut de la commande {$order->numero} est maintenant « {$data['statut']} ».",
            'donnees' => ['order_id' => $order->id],
        ]);

        return response()->json($order);
    }

    private function autoriser(Request $request, Order $order): void
    {
        abort_unless($order->boutique->user_id === $request->user()->id, 403, 'Accès non autorisé.');
    }
}
