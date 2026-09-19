<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccesNumerique;
use Illuminate\Support\Facades\Storage;

class DigitalDownloadController extends Controller
{
    /**
     * Téléchargement public via jeton — aucun compte requis.
     * Le jeton est généré à la commande (AccesNumerique) et envoyé au client
     * sur sa page de suivi de commande / reçu WhatsApp.
     */
    public function telecharger(string $token)
    {
        $acces = AccesNumerique::where('token', $token)
            ->with('orderItem.product')
            ->firstOrFail();

        abort_unless($acces->debloque, 403, 'Ce fichier sera disponible dès que le vendeur aura confirmé votre commande.');
        abort_if($acces->limiteAtteinte(), 429, 'Limite de téléchargements atteinte pour ce lien. Contactez le vendeur.');

        $produit = $acces->orderItem->product;
        abort_unless($produit && $produit->fichier_numerique_path, 404, 'Fichier introuvable.');
        abort_unless(Storage::disk('local')->exists($produit->fichier_numerique_path), 404, 'Fichier introuvable.');

        $acces->increment('nb_telechargements');

        return Storage::disk('local')->download(
            $produit->fichier_numerique_path,
            $produit->fichier_numerique_nom ?? ($produit->nom.'.pdf')
        );
    }
}
