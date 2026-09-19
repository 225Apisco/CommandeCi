<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Signalement extends Model
{
    protected $fillable = ['boutique_id', 'raison', 'details', 'signale_par', 'statut'];

    public function boutique()
    {
        return $this->belongsTo(Boutique::class);
    }
}
