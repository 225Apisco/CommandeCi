<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Boutique;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CartController extends Controller
{
    /**
     * Récupère (ou crée) le panier associé au jeton fourni par le client.
     * Le jeton est généré côté frontend et stocké en localStorage — aucun compte requis.
     */
    public function afficher(Request $request, string $slug)
    {
        $boutique = Boutique::where('slug', $slug)->firstOrFail();
        $token = $request->query('token');

        $cart = $this->trouverOuCreer($boutique, $token);

        return response()->json([
            'token' => $cart->token,
            'items' => $cart->items()->with(['product.images', 'variant'])->get(),
            'total' => $cart->total(),
        ]);
    }

    public function ajouter(Request $request, string $slug)
    {
        $boutique = Boutique::where('slug', $slug)->firstOrFail();

        $data = $request->validate([
            'token' => ['nullable', 'string'],
            'product_id' => ['required', 'integer'],
            'product_variant_id' => ['nullable', 'integer'],
            'quantite' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $produit = Product::where('boutique_id', $boutique->id)
            ->where('est_publie', true)
            ->findOrFail($data['product_id']);

        if ($produit->suivi_stock && $produit->stock < $data['quantite']) {
            return response()->json(['message' => 'Stock insuffisant pour ce produit.'], 422);
        }

        $cart = $this->trouverOuCreer($boutique, $data['token'] ?? null);

        $item = $cart->items()->firstOrNew([
            'product_id' => $produit->id,
            'product_variant_id' => $data['product_variant_id'] ?? null,
        ]);
        $item->quantite = ($item->exists ? $item->quantite : 0) + $data['quantite'];
        $item->save();

        return response()->json([
            'token' => $cart->token,
            'items' => $cart->items()->with(['product.images', 'variant'])->get(),
            'total' => $cart->fresh('items')->total(),
        ], 201);
    }

    public function modifier(Request $request, string $slug, int $itemId)
    {
        $boutique = Boutique::where('slug', $slug)->firstOrFail();
        $data = $request->validate(['quantite' => ['required', 'integer', 'min:0', 'max:99']]);

        $cart = $this->trouverParToken($boutique, $request->query('token'));
        $item = $cart->items()->findOrFail($itemId);

        if ($data['quantite'] === 0) {
            $item->delete();
        } else {
            $item->update(['quantite' => $data['quantite']]);
        }

        return response()->json([
            'items' => $cart->fresh('items')->items()->with(['product.images', 'variant'])->get(),
            'total' => $cart->fresh('items')->total(),
        ]);
    }

    private function trouverOuCreer(Boutique $boutique, ?string $token): Cart
    {
        if ($token) {
            $cart = Cart::where('boutique_id', $boutique->id)->where('token', $token)->first();
            if ($cart) {
                return $cart;
            }
        }

        return Cart::create([
            'boutique_id' => $boutique->id,
            'token' => (string) Str::uuid(),
        ]);
    }

    private function trouverParToken(Boutique $boutique, ?string $token): Cart
    {
        abort_unless($token, 422, 'Jeton de panier manquant.');

        return Cart::where('boutique_id', $boutique->id)->where('token', $token)->firstOrFail();
    }
}
