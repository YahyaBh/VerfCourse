<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Payment;
use App\Models\Student;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $payments = Payment::with(['student', 'course', 'invoice'])
            ->orderBy('created_at', 'desc')
            ->get();

        $students = Student::all();
        $courses = Course::all();

        // Get payment statistics
        $stats = [
            'totalPayments' => Payment::count(),
            'completedPayments' => Payment::where('status', 'completed')->count(),
            'pendingPayments' => Payment::where('status', 'pending')->count(),
            'failedPayments' => Payment::where('status', 'failed')->count(),
            'totalRevenue' => Payment::where('status', 'completed')->sum('amount') ?? 0,
        ];

        return Inertia::render('Admin/Payments', [
            'payments' => $payments,
            'students' => $students,
            'courses' => $courses,
            'stats' => $stats
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:students,id',
            'course_id' => 'required|exists:courses,id',
            'amount' => 'required|numeric|min:0',
            'method' => 'required|in:cash,card,bank_transfer',
            'payment_for_month' => 'required|date_format:Y-m',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check if payment already exists for this student, course, and month
        $existingPayment = Payment::where('student_id', $request->student_id)
            ->where('course_id', $request->course_id)
            ->where('payment_for_month', $request->payment_for_month)
            ->first();

        if ($existingPayment) {
            return back()->with('error', 'Payment already exists for this student, course, and month.');
        }

        $payment = Payment::create([
            'student_id' => $request->student_id,
            'course_id' => $request->course_id,
            'amount' => $request->amount,
            'method' => $request->method,
            'status' => 'pending', // Default status
            'payment_for_month' => $request->payment_for_month,
            'reference' => $request->reference,
            'notes' => $request->notes,
        ]);

        return redirect()->back()->with('success', 'Payment recorded successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $payment = Payment::with(['student', 'course', 'invoice'])->findOrFail($id);

        return Inertia::render('Admin/PaymentDetail', [
            'payment' => $payment
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:students,id',
            'course_id' => 'required|exists:courses,id',
            'amount' => 'required|numeric|min:0',
            'method' => 'required|in:cash,card,bank_transfer',
            'status' => 'required|in:pending,completed,failed',
            'payment_for_month' => 'required|date_format:Y-m',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $payment = Payment::findOrFail($id);

        // Check if another payment exists for this student, course, and month (excluding current payment)
        $existingPayment = Payment::where('student_id', $request->student_id)
            ->where('course_id', $request->course_id)
            ->where('payment_for_month', $request->payment_for_month)
            ->where('id', '!=', $id)
            ->first();

        if ($existingPayment) {
            return back()->with('error', 'Another payment already exists for this student, course, and month.');
        }

        $payment->update([
            'student_id' => $request->student_id,
            'course_id' => $request->course_id,
            'amount' => $request->amount,
            'method' => $request->method,
            'status' => $request->status,
            'payment_for_month' => $request->payment_for_month,
            'reference' => $request->reference,
            'notes' => $request->notes,
        ]);

        return redirect()->back()->with('success', 'Payment updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $payment = Payment::findOrFail($id);

        // Check if there's an invoice associated with this payment
        if ($payment->invoice) {
            return back()->with('error', 'Cannot delete payment with an associated invoice.');
        }

        $payment->delete();

        return redirect()->back()->with('success', 'Payment deleted successfully.');
    }

    /**
     * Update payment status.
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,completed,failed',
        ]);

        $payment = Payment::findOrFail($id);
        $payment->status = $request->status;
        $payment->save();

        return redirect()->back()->with('success', 'Payment status updated successfully.');
    }

    /**
     * Generate invoice for a payment.
     */
    public function generateInvoice($paymentId)
    {
        $payment = Payment::findOrFail($paymentId);

        // Check if invoice already exists for this payment
        if ($payment->invoice) {
            return back()->with('error', 'Invoice already exists for this payment.');
        }

        // Generate unique invoice number
        $invoiceNumber = 'INV-' . date('Ym') . '-' . strtoupper(uniqid());

        $invoice = Invoice::create([
            'student_id' => $payment->student_id,
            'course_id' => $payment->course_id,
            'payment_id' => $payment->id,
            'invoice_number' => $invoiceNumber,
            'amount' => $payment->amount,
            'status' => $payment->status === 'completed' ? 'paid' : 'pending',
            'issue_date' => now(),
            'due_date' => now()->addDays(30), // Due in 30 days by default
            'notes' => 'Invoice generated for payment #' . $payment->id,
        ]);

        return redirect()->back()->with('success', 'Invoice generated successfully.');
    }

    /**
     * Get payment statistics for charts.
     */
    public function getStats()
    {
        // Monthly payment amounts
        $monthlyPayments = Payment::select(
            DB::raw('MONTH(payment_for_month) as month'),
            DB::raw('SUM(amount) as total_amount')
        )
            ->where('status', 'completed')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->pluck('total_amount', 'month')
            ->toArray();

        // Fill in missing months with 0
        $allMonths = array_fill(1, 12, 0);
        $monthlyPayments = array_replace($allMonths, $monthlyPayments);

        // Payment method distribution
        $paymentMethods = Payment::select('method', DB::raw('count(*) as count'))
            ->groupBy('method')
            ->get()
            ->pluck('count', 'method')
            ->toArray();

        return response()->json([
            'monthlyPayments' => array_values($monthlyPayments),
            'paymentMethods' => $paymentMethods,
        ]);
    }
}
