<?php

// Configuration métier CommandeCI : taux de commission plateforme.
// 1% pour les boutiques standard, 2% pour les boutiques Premium (mise en avant),
// applicable dans tous les pays africains couverts par la plateforme.
return [
    'commission_rate_standard' => (float) env('COMMISSION_RATE_STANDARD', 1),
    'commission_rate_premium' => (float) env('COMMISSION_RATE_PREMIUM', 2),
];
