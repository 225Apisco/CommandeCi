<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Affiliate extends Model
{
    protected $fillable = [
        'boutique_id', 'user_id', 'nom', 'telephone', 'email',
        'code', 'nb_clics', 'nb_ventes', 'montant_commission_total', 'est_actif',
    ];

    protected function casts(): array
    {
        return ['est_actif' => 'boolean'];
    }

    protected static function booted(): void
    {
        static::creating(function (Affiliate $affilie) {
            if (empty($affilie->code)) {
                $affilie->code = static::genererCodeUnique();
            }
        });
    }

    public static function genererCodeUnique(): string
    {
        do {
            $code = strtoupper(Str::random(6));
        } while (static::where('code', $code)->exists());

        return $code;
    }

    public function lienAffiliation(): string
    {
        $base = rtrim(config('app.frontend_url', config('app.url')), '/');

        return "{$base}/b/{$this->boutique->slug}?ref={$this->code}";
    }

    public function boutique()
    {
        return $this->belongsTo(Boutique::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
