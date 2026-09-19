<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationVendeur extends Model
{
    protected $table = 'notifications_vendeur';

    protected $fillable = ['user_id', 'type', 'titre', 'message', 'donnees', 'lue_le'];

    protected function casts(): array
    {
        return ['donnees' => 'array', 'lue_le' => 'datetime'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function marquerCommeLue(): void
    {
        $this->update(['lue_le' => now()]);
    }
}
