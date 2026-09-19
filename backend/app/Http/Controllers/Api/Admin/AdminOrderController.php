<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::with(['boutique', 'customer'])
            ->when($request->statut, fn ($q) => $q->where('statut', $request->statut))
            ->when($request->boutique_id, fn ($q) => $q->where('boutique_id', $request->boutique_id))
            ->latest()
            ->paginate(25);

        return response()->json($orders);
    }
}
