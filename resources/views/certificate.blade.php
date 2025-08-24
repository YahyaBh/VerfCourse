<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Certificate</title>
    <style>
        @page {
            margin: 0;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: sans-serif;
        }

        .certificate-container {
            position: relative;
            width: 297mm;
            /* A4 landscape width */
            height: 210mm;
            /* A4 landscape height */
            background: url('{{ public_path('certificate.jpg') }}') no-repeat;
            background-size: cover;
        }

        .recipient-name {
            position: absolute;
            left: 10.2cm;
            /* Canva measurement */
            top: 10.8cm;
            font-size: 28px;
            font-weight: bold;
            color: #111827;
        }

        .course-name {
            position: absolute;
            left: 10.2cm;
            top: 12cm;
            font-size: 22px;
            font-weight: 500;
            color: #1E3A8A;
        }

        .issued-date {
            position: absolute;
            left: 10.2cm;
            top: 18cm;
            font-size: 16px;
            color: #1f2937;
        }

        .certificate-number {
            position: absolute;
            left: 14cm;
            top: 18cm;
            font-size: 16px;
            color: #1f2937;
        }

        .qr-code {
            position: absolute;
            right: 5cm;
            bottom: 3cm;
            width: 50mm;
            height: 50mm;
        }

        .qr-code img {
            width: 100%;
            height: 100%;
        }
    </style>
</head>

<body>
    <div class="certificate-container">
        <div class="recipient-name">{{ $certificate->student_name }}</div>
        <div class="course-name">{{ $certificate->course_name }}</div>
        <div class="issued-date">{{ \Carbon\Carbon::parse($certificate->issued_date)->format('d M Y') }}</div>
        <div class="certificate-number">{{ $certificate->certificate_number }}</div>

        @if (isset($qrPath))
            <div class="qr-code">
                <img src="{{ $qrPath }}" alt="QR Code">
            </div>
        @endif
    </div>
</body>

</html>
