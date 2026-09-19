<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Category extends Model
{
    protected $fillable = ['boutique_id', 'nom', 'slug', 'ordre'];

    protected static function booted(): void
    {
        static::creating(function (Category $c) {
            if (empty($c->slug)) {
                $c->slug = Str::slug($c->nom);
            }
        });
    }

    public function boutique()
    {
        return $this->belongsTo(Boutique::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
