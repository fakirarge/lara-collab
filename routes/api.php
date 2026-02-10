<?php

use App\Http\Controllers\Api\ProjectNoteController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware('auth:sanctum')->group(function () {
    // Project Notes
    Route::post('projects/{project}/notes', [ProjectNoteController::class, 'store']);
    Route::get('projects/{project}/notes', [ProjectNoteController::class, 'index']);
    Route::get('projects/{project}/notes/{note}', [ProjectNoteController::class, 'show']);
    Route::put('projects/{project}/notes/{note}', [ProjectNoteController::class, 'update']);
    Route::delete('projects/{project}/notes/{note}', [ProjectNoteController::class, 'destroy']);
});

