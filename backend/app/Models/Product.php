<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Product extends Model
{
    protected $fillable = [
        'boutique_id', 'category_id', 'nom', 'slug', 'description',
        'prix', 'prix_promo', 'stock', 'suivi_stock', 'est_publie',
        'nb_vues', 'nb_ventes',
        'type_produit', 'fichier_numerique_path', 'fichier_numerique_nom',
        'fichier_numerique_taille', 'livraison_numerique',
        'autoriser_affiliation', 'taux_commission_affilie',
    ];

    protected function casts(): array
    {
        return [
            'suivi_stock' => 'boolean',
            'est_publie' => 'boolean',
            'prix' => 'decimal:2',
            'prix_promo' => 'decimal:2',
            'autoriser_affiliation' => 'boolean',
            'taux_commission_affilie' => 'decimal:2',
        ];
    }

    public function estNumerique(): bool
    {
        return $this->type_produit === 'numerique';
    }

    protected static function booted(): void
    {
        static::creating(function (Product $p) {
            if (empty($p->slug)) {
                $base = Str::slug($p->nom);
                $slug = $base;
                $i = 1;
                while (static::where('boutique_id', $p->boutique_id)->where('slug', $slug)->exists()) {
                    $slug = "{$base}-{$i}";
                    $i++;
                }
                $p->slug = $slug;
            }
        });
    }

    public function prixAffiche(): float
    {
        return (float) ($this->prix_promo ?? $this->prix);
    }

    public function enStock(): bool
    {
        if ($this->estNumerique()) {
            return true; // pas de rupture possible pour un produit numérique
        }

        return ! $this->suivi_stock || $this->stock > 0;
    }

    public function boutique()
    {
        return $this->belongsTo(Boutique::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('ordre');
    }
}
