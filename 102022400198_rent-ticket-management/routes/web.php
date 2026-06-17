<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
Route::redirect('api/v1/ticket-service/documentation', url('api/documentation'));