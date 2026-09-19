<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    public const STATUTS = ['nouvelle', 'confirmee', 'preparation', 'expediee', 'livree', 'annulee'];

    /** Transitions autorisées pour éviter les sauts de statut incohérents. */
    public const TRANSITIONS = [
        'nouvelle' => ['confirmee', 'annulee'],
        'confirmee' => ['preparation', 'annulee'],
        'preparation' => ['expediee', 'annulee'],
        'expediee' => ['livree', 'annulee'],
        'livree' => [],
        'annulee' => [],
    ];

    protected $fillable = [
        'boutique_id', 'customer_id', 'affiliate_id', 'code_affilie_utilise', 'numero', 'statut',
        'sous_total', 'frais_livraison', 'total',
        'taux_commission_applique', 'montant_commission', 'montant_commission_affilie',
        'adresse_livraison', 'ville_livraison', 'note_client',
        'canal_origine', 'statut_paiement',
        'confirmee_le', 'livree_le', 'annulee_le',
    ];

    protected function casts(): array
    {
        return [
            'confirmee_le' => 'datetime',
            'livree_le' => 'datetime',
            'annulee_le' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            if (empty($order->numero)) {
                $order->numero = static::genererNumero();
            }
        });
    }

    public static function genererNumero(): string
    {
        $annee = now()->format('Y');
        $sequence = static::whereYear('created_at', now()->year)->count() + 1;

        return sprintf('CCI-%s-%06d', $annee, $sequence);
    }

    /**
     * Applique une nouvelle transition de statut si elle est autorisée.
     */
    public function changerStatut(string $nouveauStatut): bool
    {
        if (! in_array($nouveauStatut, self::TRANSITIONS[$this->statut] ?? [], true)) {
            return false;
        }

        $this->statut = $nouveauStatut;

        match ($nouveauStatut) {
            'confirmee' => $this->confirmee_le = now(),
            'livree' => $this->livree_le = now(),
            'annulee' => $this->annulee_le = now(),
            default => null,
        };

        $this->save();

        return true;
    }

    public function boutique()
    {
        return $this->belongsTo(Boutique::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function affiliate()
    {
        return $this->belongsTo(Affiliate::class);
    }

    /** true si la commande ne contient que des produits numériques (pas de livraison physique). */
    public function estUniquementNumerique(): bool
    {
        return $this->items->every(fn (OrderItem $item) => $item->product?->estNumerique());
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
