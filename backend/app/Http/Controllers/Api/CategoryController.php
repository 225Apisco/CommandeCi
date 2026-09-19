<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $boutique = $request->user()->boutique()->firstOrFail();

        return response()->json($boutique->categories()->orderBy('ordre')->get());
    }

    public function store(Request $request)
    {
        $boutique = $request->user()->boutique()->firstOrFail();

        $data = $request->validate([
            'nom' => ['required', 'string', 'max:80'],
            'ordre' => ['nullable', 'integer'],
        ]);

        $categorie = $boutique->categories()->create($data);

        return response()->json($categorie, 201);
    }

    public function update(Request $request, int $id)
    {
        $boutique = $request->user()->boutique()->firstOrFail();
        $categorie = $boutique->categories()->findOrFail($id);

        $data = $request->validate([
            'nom' => ['sometimes', 'string', 'max:80'],
            'ordre' => ['nullable', 'integer'],
        ]);

        $categorie->update($data);

        return response()->json($categorie);
    }

    public function destroy(Request $request, int $id)
    {
        $boutique = $request->user()->boutique()->firstOrFail();
        $boutique->categories()->findOrFail($id)->delete();

        return response()->json(['message' => 'Catégorie supprimée.']);
    }
}
