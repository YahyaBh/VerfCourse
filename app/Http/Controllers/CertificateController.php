<?php

namespace App\Http\Controllers;


use App\Models\Certificate;
use App\Models\Course;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use chillerlan\QRCode\{QRCode, QROptions};
use setasign\Fpdi\Fpdi;
use Carbon\Carbon;
use Illuminate\Container\Attributes\Storage;

class CertificateController extends Controller
{


    public function dashboard()
    {


        $certificates = Certificate::all();
        $students = Student::all();
        $courses = Course::all();
        $stats = [
            'totalCertificates' => $certificates->count(),
            'totalStudents' => $students->count(),
        ];

        return Inertia::render('Admin/AdminDashboard', [
            'certificates' => $certificates,
            'students' => $students,
            'courses' => $courses,
            'stats' => $stats
        ]);
    }


    public function certificates()
    {
        $certificates = Certificate::all();
        $students = Student::all();
        $courses = Course::all();

        return Inertia::render('Admin/Certificates', [
            'certificates' => $certificates,
            'students' => $students,
            'courses' => $courses
        ]);
    }




    public function block($id)
    {
        $certificate = Certificate::findOrFail($id);
        $certificate->blocked = true;
        $certificate->save();
        return redirect()->route('admin.certificates.index')->with('success', 'Certificate blocked successfully');
    }

    public function unblock($id)
    {
        $certificate = Certificate::findOrFail($id);
        $certificate->blocked = false;
        $certificate->save();
        return redirect()->route('admin.certificates.index')->with('success', 'Certificate unblocked successfully');
    }


    public function destroy($id)
    {
        $certificate = Certificate::findOrFail($id);
        $certificate->delete();
        return redirect()->back();
    }






    public function verify(Request $request)
    {
        $request->validate([
            'certificate_number' => 'required|string',
        ]);

        $certificate = Certificate::where('certificate_number', $request->certificate_number)->first();

        if ($certificate) {
            return Inertia::render('Certificate', [
                'certificate' => $certificate,
            ]);
        } else {
            return Inertia::render('Certificate', [
                'error' => 'Please verify your certificate number or enter a valid one  .',
            ]);
        }
    }


    public function show($id)
    {

        $certificate = Certificate::findOrFail($id);
        if (!$certificate) {
            return redirect()->route('certificates.index')->with('error', 'Certificate not found.');
        } else {
        }

        return Inertia::render("Certificate", [
            "certificate" => $certificate
        ]);
    }


    public function downloadPDF($id)
    {
        $certificate = Certificate::findOrFail($id);

        // --------------------------
        // Step 1: Generate QR code
        // --------------------------
        $options = new QROptions([
            'outputType' => QRCode::OUTPUT_IMAGE_PNG,
            'eccLevel'   => QRCode::ECC_L,
            'scale'      => 5,
        ]);
        $qr = new QRCode($options);
        $qrPath = storage_path('app/public/qr_' . $certificate->certificate_number . '.png');
        $qr->render('https://certificate.webinadigital.com/' . $certificate->certificate_number, $qrPath);

        // --------------------------
        // Step 2: Prepare FPDI
        // --------------------------
        $pdf = new Fpdi();
        $pdf->AddPage('L'); // Landscape

        // Import existing PDF certificate
        $pageCount = $pdf->setSourceFile(public_path('Cert.pdf'));
        $tplIdx = $pdf->importPage(1);
        $pdf->useTemplate($tplIdx, 0, 0, 297, 210); // A4 landscape in mm

        // --------------------------
        // Step 3: Overlay text
        // --------------------------
        // Capitalize student name
        $name = strtoupper($certificate->student_name);
        $pdf->SetFont('Times', 'B', 38); // Bold for name
        $pdf->SetXY(120, 100); // adjust X, Y in mm
        $pdf->Write(0, $name);

        // Course name
        // $pdf->SetFont('Helvetica', '', 22);
        // $pdf->SetXY(102, 120);
        // $pdf->Write(0, $certificate->course_name);

        // Issued date
        $pdf->SetFont('Times', '', 14);
        $pdf->SetXY(200, 156);
        $pdf->Write(0, Carbon::parse($certificate->issued_date)->format('d M Y'));

        // Certificate number
        $pdf->SetXY(230, 72);
        $pdf->SetFont('Helvetica', '', 12);
        $pdf->Write(0, $certificate->certificate_number);

        // --------------------------
        // Step 4: Add QR code
        // --------------------------
        $pdf->Image($qrPath, 230, 30, 40, 40); // x, y, width, height in mm

        // --------------------------
        // Step 5: Output PDF
        // --------------------------
        $pdf->Output('D', 'Certificate-' . $certificate->certificate_number . '.pdf');
    }




    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'course' => 'required|string|max:255',
            'issued_date' => 'required|date',
            'course_link' => 'nullable|string|max:255',
            'pdf_file' => 'nullable|file|mimes:pdf|max:2048', // Optional PDF file
        ]);

        $year = date('Y');

        // Generate unique certificate number
        do {
            $randomNumber = mt_rand(10000, 99999); // 5-digit number
            $certificateNumber = "WEBC-{$year}-{$randomNumber}";
        } while (Certificate::where('certificate_number', $certificateNumber)->exists());

        $certificate = Certificate::create([
            'student_name' => $request->name,
            'course_name' => $request->course,
            'issued_date' => $request->issued_date,
            'certificate_number' => $certificateNumber,
            // 'course_link' => $request->course_link ? $request->course_link : null
        ]);

        return redirect()->route('certificates.show', ['certificate' => $certificate, 'id' => $certificate->id])
            ->with('success', 'Certificate created successfully.');
    }

    public function update(Request $request, $id)
    {




        $request->validate([
            'name' => 'required|string|max:255',
            'course' => 'required|string|max:255',
            'issued_date' => 'required|date',
            'course_link' => 'nullable|string|max:255',
            'pdf_file' => 'nullable|file|mimes:pdf|max:2048', // Optional PDF file
        ]);

        $certificate = Certificate::findOrFail($id);

        if ($request->hasFile('pdf_file')) {

            if ($certificate->pdf_file && Storage::exists('public/' . $certificate->pdf_file)) {
                Storage::delete('public/' . $certificate->pdf_file);
            }

            $path = $request->file('pdf_file')->store('certificates', 'public');
            $certificate->pdf_file = $path;
        }

        // Update certificate fields
        $certificate->update([
            'student_name' => $request->name,
            'course_name' => $request->course,
            'issued_date' => $request->issued_date,
            'expiry_date' => $request->expiry_date ?? null,
            // 'course_link' => $request->course_link ?? null,
        ]);

        return response()->json(['message' => 'Certificate updated successfully', 'certificate' => $certificate], 200);
    }


    public function verifyExt($certificate_number)
    {

        if (!preg_match('/^WEBC-[A-Z0-9-]+$/', $certificate_number)) {
            return Inertia::render('Certificate', [
                'error' => 'Invalid certificate number format.',
            ]);
        }

        $certificate = Certificate::where('certificate_number', $certificate_number)->first();

        if ($certificate) {
            return Inertia::render('Certificate', [
                'certificate' => $certificate,
            ]);
        } else {
            return Inertia::render('Certificate', [
                'error' => 'Please verify your certificate number or enter a valid one  .',
            ]);
        }
    }
}
