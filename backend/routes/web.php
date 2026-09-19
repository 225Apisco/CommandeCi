<?php

use Illuminate\Support\Facades\Route;

// CommandeCI est une API pure — le frontend React est servi séparément (Vite).
// Cette route sert uniquement de vérification rapide que le backend répond.
Route::get('/', function () {
    return response()->json([
        'app' => 'CommandeCI API',
        'status' => 'ok',
    ]);
});
