<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->notifications()->latest()->paginate(20)
        );
    }

    public function marquerLue(Request $request, int $id)
    {
        $notif = $request->user()->notifications()->findOrFail($id);
        $notif->marquerCommeLue();

        return response()->json($notif);
    }

    public function toutMarquerLu(Request $request)
    {
        $request->user()->notifications()->whereNull('lue_le')->update(['lue_le' => now()]);

        return response()->json(['message' => 'Toutes les notifications ont été marquées comme lues.']);
    }
}
