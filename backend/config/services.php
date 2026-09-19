<?php

return [
    // Emplacement réservé pour les futures intégrations (Wave, Orange Money, MTN MoMo...)
    'wave' => [
        'api_key' => env('WAVE_API_KEY'),
        'api_secret' => env('WAVE_API_SECRET'),
        'sandbox' => env('PAYMENT_SANDBOX', true),
    ],
];
