<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\StudentController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Certificate verification (external + internal)
Route::get('/{certificate_number}', [CertificateController::class, 'verifyExt'])
    ->where('certificate_number', 'WEBC-[A-Z0-9-]+');

Route::get('/verify-certificate', [CertificateController::class, 'index'])->name('certificates.index');
Route::post('/certificates/verify', [CertificateController::class, 'verify'])->name('certificates.verify');
Route::get('/certificates/verify', function () {
    return redirect('/');
});

Route::get('/certificate/{id}', [CertificateController::class, 'show'])->name('certificates.show');
Route::get('/certificates/{id}/download', [CertificateController::class, 'downloadPDF'])
    ->name('certificates.download');





/*
|--------------------------------------------------------------------------
| Dashboard + Authenticated Routes
|--------------------------------------------------------------------------
*/






// Route::get('/dashboard', function () {
//     return Inertia::render('Admin/AdminDashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth'])->group(function () {

    // Admin Dashboard
    Route::get('/admin/dashboard', [CertificateController::class, 'dashboard'])->name('dashboard');
    Route::get('/admin/stats', [CertificateController::class, 'getStats'])->name('admin.stats');
    Route::get('/admin/certificates', [CertificateController::class, 'certificates'])->name('admin.certificates');

    // Certificate management routes
    Route::get('/certificates', [CertificateController::class, 'index'])->name('admin.certificates.index');
    Route::post('/certificate/store', [CertificateController::class, 'store'])->name('certificate.store');
    Route::post('/certificate/update/{id}', [CertificateController::class, 'update'])->name('admin.certificate.update');
    Route::post('/admin/certificate/block/{id}', [CertificateController::class, 'block'])->name('admin.certificate.block');
    Route::post('/admin/certificate/unblock/{id}', [CertificateController::class, 'unblock'])->name('admin.certificate.unblock');
    Route::delete('/certificate/destroy/{id}', [CertificateController::class, 'destroy'])->name('admin.certificate.delete');



    //Students management routes
    Route::get('/admin/students', [StudentController::class, 'index']); // Get all students
    Route::get('/admin/students/{id}', [StudentController::class, 'show'])->name('admin.students.show');


    //Student management routes
    Route::post('/api/student/create', [StudentController::class, 'store'])->name('api.student.create');
    Route::put('/api/student/update/{id}', [StudentController::class, 'update'])->name('api.student.update');
    Route::post('/api/student/enroll', [StudentController::class, 'enrollStudentInCourse']);
    Route::put('/api/student/grade/{studentCourseId}', [StudentController::class, 'updateGrades']);
    Route::delete('/api/student/{studentId}', [StudentController::class, 'destroy']); // Delete student
    Route::put('/api/student/ban/{studentId}', [StudentController::class, 'banStudent']); // Ban student
    Route::put('/api/student/unban/{studentId}', [StudentController::class, 'unbanStudent']); // Unban student
    Route::put('/api/student/payment-status/{studentId}', [StudentController::class, 'updatePaymentStatus']); // Update payment status
    Route::put('/api/student/change-course/{studentId}', [StudentController::class, 'changeCourse']); // Change course





    // Admin Courses Routes
    Route::get('/admin/courses', [CourseController::class, 'index'])->name('admin.courses');
    Route::post('/course/create', [CourseController::class, 'store'])->name('api.course.create');
    Route::post('/course/update/{id}', [CourseController::class, 'update'])->name('api.course.update');
    Route::delete('/course/{id}', [CourseController::class, 'destroy'])->name('api.course.delete');
    Route::put('/course/toggle-active/{id}', [CourseController::class, 'toggleActive'])->name('api.course.toggle-active');



    //Attendance and Sessions
    Route::get('/courses/{course}/attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    Route::post('/courses/{course}/attendance/session', [AttendanceController::class, 'storeSession'])->name('attendance.session.store');
    Route::patch('/sessions/{session}/attendance/{attendance}', [AttendanceController::class, 'updateAttendance'])->name('attendance.update');


    // List all invoices
    Route::get('/admin/invoices', [InvoiceController::class, 'index'])->name('invoices.index');
    Route::get('/invoices/{id}', [InvoiceController::class, 'show'])->name('invoices.show');
    Route::get('/invoices/{id}/download', [InvoiceController::class, 'downloadPdf'])->name('invoices.download');
    Route::post('/payments/{paymentId}/generate-invoice', [InvoiceController::class, 'generateInvoiceForPayment'])
        ->name('invoices.generate');


    // Payment Routes
    Route::get('/admin/payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::post('/admin/payment/create', [PaymentController::class, 'store'])->name('payments.create');
    Route::get('/payments/stats', [PaymentController::class, 'getStats'])->name('payments.stats');
    Route::put('/payments/{id}', [PaymentController::class, 'update'])->name('payments.update');
    Route::delete('/payments/{id}', [PaymentController::class, 'destroy'])->name('payments.delete');
    Route::post('/payments/{id}/status', [PaymentController::class, 'updateStatus'])->name('payments.status');
});


require __DIR__ . '/auth.php';
