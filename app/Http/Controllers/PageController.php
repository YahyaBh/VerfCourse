<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class PageController extends Controller
{
    public function notfound()
    {
        return Inertia::render('Errors/404', [
            'message' => 'Page not found',
        ]);
    }
}
