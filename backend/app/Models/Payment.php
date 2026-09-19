<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'order_id', 'fournisseur', 'reference_externe', 'montant', 'statut', 'donnees_brutes',
    ];

    protected function casts(): array
    {
        return ['donnees_brutes' => 'array'];
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
