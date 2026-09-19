<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'boutique_id', 'nom', 'telephone', 'email', 'adresse', 'ville', 'quartier', 'note_livraison',
    ];

    public function boutique()
    {
        return $this->belongsTo(Boutique::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function nombreCommandes(): int
    {
        return $this->orders()->count();
    }

    public function totalDepense(): float
    {
        return (float) $this->orders()->where('statut', 'livree')->sum('total');
    }
}
