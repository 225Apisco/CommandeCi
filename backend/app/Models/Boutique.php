<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Boutique extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'nom', 'slug', 'logo_path', 'banniere_path', 'description',
        'whatsapp_numero', 'ville', 'pays', 'devise', 'couleur_theme',
        'plan', 'taux_commission', 'premium_expire_le',
        'est_active', 'est_verifiee',
    ];

    protected function casts(): array
    {
        return [
            'est_active' => 'boolean',
            'est_verifiee' => 'boolean',
            'taux_commission' => 'decimal:2',
            'premium_expire_le' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Boutique $boutique) {
            if (empty($boutique->slug)) {
                $boutique->slug = static::genererSlugUnique($boutique->nom);
            }
        });
    }

    public static function genererSlugUnique(string $nom): string
    {
        $base = Str::slug($nom);
        $slug = $base;
        $i = 1;
        while (static::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }

    /**
     * Taux de commission CommandeCI applicable en ce moment.
     * 1% en standard, 2% pour les boutiques Premium — valable dans tous les pays.
     */
    public function tauxCommissionActuel(): float
    {
        $standard = (float) config('commandeci.commission_rate_standard', 1);
        $premium = (float) config('commandeci.commission_rate_premium', 2);

        if ($this->plan === 'premium' && (! $this->premium_expire_le || $this->premium_expire_le->isFuture())) {
            return $premium;
        }

        return $standard;
    }

    public function estPremiumActif(): bool
    {
        return $this->plan === 'premium' && (! $this->premium_expire_le || $this->premium_expire_le->isFuture());
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function customers()
    {
        return $this->hasMany(Customer::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function affiliates()
    {
        return $this->hasMany(Affiliate::class);
    }

    public function urlPublique(): string
    {
        return rtrim(config('app.frontend_url', config('app.url')), '/')."/b/{$this->slug}";
    }
}
