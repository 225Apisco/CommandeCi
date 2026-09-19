<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    protected $fillable = ['boutique_id', 'token'];

    public function boutique()
    {
        return $this->belongsTo(Boutique::class);
    }

    public function items()
    {
        return $this->hasMany(CartItem::class);
    }

    public function total(): float
    {
        return $this->items->sum(function (CartItem $item) {
            $prix = $item->product->prixAffiche() + ($item->variant?->supplement_prix ?? 0);

            return $prix * $item->quantite;
        });
    }
}
