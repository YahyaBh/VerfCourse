<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #eab308;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
        }
        .invoice-info {
            text-align: right;
        }
        .invoice-number {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
        }
        .invoice-date {
            color: #6b7280;
            font-size: 14px;
        }
        .company-info {
            margin-bottom: 30px;
        }
        .company-info h3 {
            margin: 0 0 10px 0;
            color: #1f2937;
        }
        .company-info p {
            margin: 5px 0;
            color: #6b7280;
        }
        .billing-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        .billing-section {
            width: 48%;
        }
        .billing-section h3 {
            margin: 0 0 10px 0;
            color: #1f2937;
            font-size: 16px;
        }
        .billing-section p {
            margin: 5px 0;
            color: #6b7280;
            font-size: 14px;
        }
        .table-container {
            margin-bottom: 30px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        th {
            background-color: #f9fafb;
            font-weight: 600;
            color: #374151;
        }
        .total-section {
            display: flex;
            justify-content: flex-end;
            margin-top: 20px;
        }
        .total-box {
            width: 300px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .total-row.final {
            border-top: 2px solid #e5e7eb;
            padding-top: 10px;
            font-weight: bold;
            font-size: 18px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        .status-paid {
            background-color: #d1fae5;
            color: #065f46;
        }
        .status-pending {
            background-color: #fed7aa;
            color: #9a3412;
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">
                WEBINA
            </div>
            <div class="invoice-info">
                <div class="invoice-number">Invoice #{{ $invoice->invoice_number }}</div>
                <div class="invoice-date">Date: {{ $invoice->created_at->format('d M Y') }}</div>
                <div class="status-badge {{ $payment->status === 'completed' ? 'status-paid' : 'status-pending' }}">
                    {{ ucfirst($payment->status) }}
                </div>
            </div>
        </div>

        <!-- Company Information -->
        <div class="company-info">
            <h3>WEBINA Training Center</h3>
            <p>123 Education Street</p>
            <p>City, State 12345</p>
            <p>Phone: (123) 456-7890</p>
            <p>Email: info@webina.com</p>
        </div>

        <!-- Billing Information -->
        <div class="billing-info">
            <div class="billing-section">
                <h3>Bill To:</h3>
                <p><strong>{{ $student->first_name }} {{ $student->last_name }}</strong></p>
                <p>{{ $student->email }}</p>
                <p>{{ $student->phone_number }}</p>
            </div>
            <div class="billing-section">
                <h3>Course Information:</h3>
                <p><strong>{{ $course->name }}</strong></p>
                <p>Duration: {{ $course->duration }} weeks</p>
                <p>Instructor: {{ $course->instructor }}</p>
            </div>
        </div>

        <!-- Payment Details Table -->
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Payment Month</th>
                        <th>Payment Method</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Course Fee - {{ $course->name }}</td>
                        <td>{{ \Carbon\Carbon::parse($payment->payment_for_month)->format('F Y') }}</td>
                        <td>{{ ucfirst($payment->method) }}</td>
                        <td>${{ number_format($payment->amount, 2) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Total Section -->
        <div class="total-section">
            <div class="total-box">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>${{ number_format($payment->amount, 2) }}</span>
                </div>
                <div class="total-row">
                    <span>Tax (0%):</span>
                    <span>$0.00</span>
                </div>
                <div class="total-row final">
                    <span>Total:</span>
                    <span>${{ number_format($payment->amount, 2) }}</span>
                </div>
            </div>
        </div>

        <!-- Additional Information -->
        @if($payment->notes)
        <div style="margin-top: 30px;">
            <h3 style="margin-bottom: 10px; color: #1f2937;">Notes:</h3>
            <p style="color: #6b7280; margin: 0;">{{ $payment->notes }}</p>
        </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            <p>Thank you for choosing WEBINA Training Center. For any inquiries, please contact us at info@webina.com</p>
            <p>This is a computer-generated invoice. No signature is required.</p>
        </div>
    </div>
</body>
</html>
