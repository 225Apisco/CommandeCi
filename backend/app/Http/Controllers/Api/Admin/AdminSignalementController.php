<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Signalement;
use Illuminate\Http\Request;

class AdminSignalementController extends Controller
{
    public function index(Request $request)
    {
        $signalements = Signalement::with('boutique')
            ->when($request->statut, fn ($q) => $q->where('statut', $request->statut))
            ->latest()
            ->paginate(20);

        return response()->json($signalements);
    }

    public function traiter(Request $request, Signalement $signalement)
    {
        $data = $request->validate(['statut' => ['required', 'in:en_cours,resolu,rejete']]);
        $signalement->update($data);

        return response()->json($signalement);
    }
}
