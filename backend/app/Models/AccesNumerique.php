<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AccesNumerique extends Model
{
    protected $table = 'acces_numeriques';

    protected $fillable = [
        'order_item_id', 'token', 'nb_telechargements', 'limite_telechargements', 'debloque',
    ];

    protected function casts(): array
    {
        return ['debloque' => 'boolean'];
    }

    protected static function booted(): void
    {
        static::creating(function (AccesNumerique $acces) {
            if (empty($acces->token)) {
                $acces->token = Str::random(48);
            }
        });
    }

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class, 'order_item_id');
    }

    public function limiteAtteinte(): bool
    {
        return $this->nb_telechargements >= $this->limite_telechargements;
    }
}
