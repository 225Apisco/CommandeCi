<?php

use App\Http\Controllers\Api\Admin\AdminBoutiqueController;
use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminSignalementController;
use App\Http\Controllers\Api\Admin\AdminStatController;
use App\Http\Controllers\Api\AffiliateController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BoutiqueController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DigitalDownloadController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes publiques — pas d'authentification (client final, sans compte)
|--------------------------------------------------------------------------
*/
Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::prefix('boutiques/{slug}')->group(function () {
    Route::get('/', [BoutiqueController::class, 'vitrine']);
    Route::get('/panier', [CartController::class, 'afficher']);
    Route::post('/panier', [CartController::class, 'ajouter'])->middleware('throttle:60,1');
    Route::put('/panier/{itemId}', [CartController::class, 'modifier']);
    Route::post('/commandes', [OrderController::class, 'passerCommande'])->middleware('throttle:20,1');
    Route::post('/affiliation', [AffiliateController::class, 'inscrire'])->middleware('throttle:10,1');
    Route::get('/affiliation/clic/{code}', [AffiliateController::class, 'suivreClic'])->middleware('throttle:60,1');
});
Route::get('/commandes/{numero}/suivi', [OrderController::class, 'suivre'])->middleware('throttle:20,1');
Route::get('/affilies/{code}/tableau-de-bord', [AffiliateController::class, 'tableauDeBord'])->middleware('throttle:20,1');
Route::get('/telechargements/{token}', [DigitalDownloadController::class, 'telecharger'])->middleware('throttle:30,1');
Route::post('/paiements/webhook/{fournisseur}', [PaymentController::class, 'webhook']);

/*
|--------------------------------------------------------------------------
| Routes vendeur — protégées par Sanctum
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/moi', [AuthController::class, 'me']);

    Route::post('/ma-boutique', [BoutiqueController::class, 'store']);
    Route::get('/ma-boutique', [BoutiqueController::class, 'moi']);
    Route::put('/ma-boutique', [BoutiqueController::class, 'update']);

    Route::apiResource('categories', CategoryController::class)->except(['show']);
    Route::apiResource('produits', ProductController::class)->parameters(['produits' => 'product']);

    Route::get('/commandes', [OrderController::class, 'index']);
    Route::get('/commandes/{order}', [OrderController::class, 'show']);
    Route::put('/commandes/{order}/statut', [OrderController::class, 'changerStatut']);
    Route::get('/commandes/{order}/facture', [InvoiceController::class, 'show']);
    Route::post('/commandes/{order}/paiement', [PaymentController::class, 'initier']);

    Route::get('/clients', [CustomerController::class, 'index']);
    Route::get('/clients/{id}', [CustomerController::class, 'show']);

    Route::get('/tableau-de-bord', [DashboardController::class, 'stats']);

    Route::get('/affilies', [AffiliateController::class, 'index']);
    Route::put('/affilies/{affiliate}/activation', [AffiliateController::class, 'basculerActivation']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/lue', [NotificationController::class, 'marquerLue']);
    Route::put('/notifications/tout-lire', [NotificationController::class, 'toutMarquerLu']);

    /*
    |--------------------------------------------------------------------
    | Routes admin — Sanctum + middleware "admin"
    |--------------------------------------------------------------------
    */
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/boutiques', [AdminBoutiqueController::class, 'index']);
        Route::put('/boutiques/{boutique}/plan', [AdminBoutiqueController::class, 'definirPlan']);
        Route::put('/boutiques/{boutique}/suspendre', [AdminBoutiqueController::class, 'suspendre']);
        Route::put('/boutiques/{boutique}/reactiver', [AdminBoutiqueController::class, 'reactiver']);

        Route::get('/commandes', [AdminOrderController::class, 'index']);

        Route::get('/signalements', [AdminSignalementController::class, 'index']);
        Route::put('/signalements/{signalement}', [AdminSignalementController::class, 'traiter']);

        Route::get('/statistiques', [AdminStatController::class, 'apercu']);
    });
});
