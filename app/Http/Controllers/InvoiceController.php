<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\Request;
use Carbon\Carbon;
use PDF; // Make sure barryvdh/laravel-dompdf is installed

class InvoiceController extends Controller
{
    public function index()
    {
        $invoices = Invoice::with(['payment.student', 'payment.course'])
            ->orderBy('issued_date', 'desc')
            ->get();

        return inertia('Invoices/Index', [
            'invoices' => $invoices
        ]);
    }

    /**
     * Show details of a single invoice.
     */
    public function show($id)
    {
        $invoice = Invoice::with(['payment.student', 'payment.course'])->findOrFail($id);

        return inertia('Invoices/Show', [
            'invoice' => $invoice
        ]);
    }

    /**
     * Generate a PDF for a given invoice.
     */
    public function downloadPdf($id)
    {
        $invoice = Invoice::with(['payment.student', 'payment.course'])->findOrFail($id);

        $pdf = PDF::loadView('invoices.template', [
            'invoice' => $invoice,
            'payment' => $invoice->payment,
            'student' => $invoice->payment->student,
            'course' => $invoice->payment->course,
        ]);

        return $pdf->download($invoice->invoice_number . '.pdf');
    }

    /**
     * Create an invoice for a completed payment.
     */
    public function generateInvoiceForPayment($paymentId)
    {
        $payment = Payment::with('student', 'course')->findOrFail($paymentId);

        if ($payment->status !== 'completed') {
            return response()->json(['error' => 'Payment is not completed.'], 400);
        }

        // Generate invoice number: INV-YYYY-0001
        $invoiceNumber = 'INV-' . Carbon::now()->format('Y') . '-' . str_pad($payment->id, 4, '0', STR_PAD_LEFT);

        $invoice = Invoice::create([
            'payment_id' => $payment->id,
            'invoice_number' => $invoiceNumber,
            'issued_date' => Carbon::now()->toDateString(),
        ]);

        return response()->json([
            'message' => 'Invoice generated successfully',
            'invoice' => $invoice
        ]);
    }
}
