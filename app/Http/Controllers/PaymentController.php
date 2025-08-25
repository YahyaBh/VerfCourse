<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    //


    public function index()
    {
        $students = Student::all();
        $payments = Payment::with(['student', 'course', 'invoice'])->get();

        return Inertia::render('Admin/Payments', compact('payments', 'students'));
    }
}
