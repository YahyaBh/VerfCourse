<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Course;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;

class StudentController extends Controller
{
    // Get all students with their course information and payment status
    public function index()
    {
        $students = Student::all();
        $courses = Course::all();
        
        // Get all student-course relationships
        $studentCourses = \DB::table('student_course')->get();
        
        // Get all payments
        $payments = Payment::all();

        return Inertia::render('Admin/Students', [
            'students' => $students,
            'courses' => $courses,
            'studentCourses' => $studentCourses,
            'payments' => $payments
        ]);
    }

    // Store a new student
    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:students',
            'status' => 'required|in:active,banned',
            'course_id' => 'nullable|exists:courses,id',
            'payment_status' => 'required|in:pending,completed',
        ]);

        $student = Student::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'status' => $request->status,
        ]);

        // If a course_id is provided, enroll the student in the course
        if ($request->course_id) {
            $student->courses()->attach($request->course_id);
        }

        // Create a payment record for the student
        Payment::create([
            'student_id' => $student->id,
            'status' => $request->payment_status,
            'amount' => 0, // You can adjust this as needed
            'payment_date' => now(),
        ]);

        return response()->json([
            'message' => 'Student created successfully',
            'student' => $student,
        ]);
    }

    public function show($id)
    {
        $student = Student::findOrFail($id);
        $courses = Course::all();
        
        // Get the student's courses with pivot data
        $studentCourses = $student->courses()->withPivot([
            'weekly_quizzes_score',
            'exercises_score',
            'final_project_score',
            'participation_score',
            'total_score',
            'grade'
        ])->get();
        
        // Get the student's payment status
        $payments = Payment::where('student_id', $student->id)->get();
        $paymentStatus = 'pending'; // Default status
        
        // Check if the student has any completed payments
        if ($payments->where('status', 'completed')->count() > 0) {
            $paymentStatus = 'completed';
        }
        
        // Convert to an array
        $studentGrades = $studentCourses->toArray();

        return Inertia::render('Admin/Student', [
            'student' => $student,
            'courses' => $courses,
            'studentGrades' => $studentGrades,
            'paymentStatus' => $paymentStatus
        ]);
    }

    public function updateGrades(Request $request, $id)
    {
        $student = Student::findOrFail($id);
        
        $validated = $request->validate([
            'grades' => 'required|array',
            'grades.*.weekly_quizzes_score' => 'nullable|numeric|min:0|max:25',
            'grades.*.exercises_score' => 'nullable|numeric|min:0|max:25',
            'grades.*.final_project_score' => 'nullable|numeric|min:0|max:25',
            'grades.*.participation_score' => 'nullable|numeric|min:0|max:25',
        ]);

        foreach ($validated['grades'] as $courseId => $grades) {
            $totalScore = (
                ($grades['weekly_quizzes_score'] ?? 0) +
                ($grades['exercises_score'] ?? 0) +
                ($grades['final_project_score'] ?? 0) +
                ($grades['participation_score'] ?? 0)
            );

            $grade = 'F';
            if ($totalScore >= 90) $grade = 'A';
            elseif ($totalScore >= 80) $grade = 'B';
            elseif ($totalScore >= 70) $grade = 'C';
            elseif ($totalScore >= 60) $grade = 'D';

            $student->courses()->updateExistingPivot($courseId, [
                'weekly_quizzes_score' => $grades['weekly_quizzes_score'] ?? 0,
                'exercises_score' => $grades['exercises_score'] ?? 0,
                'final_project_score' => $grades['final_project_score'] ?? 0,
                'participation_score' => $grades['participation_score'] ?? 0,
                'total_score' => $totalScore,
                'grade' => $grade
            ]);
        }

        return back()->with('success', 'Grades updated successfully');
    }

    // Update a student
    public function update(Request $request, $id)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:students,email,' . $id,
            'status' => 'required|in:active,banned',
            'course_id' => 'nullable|exists:courses,id',
            'payment_status' => 'required|in:pending,completed',
        ]);

        $student = Student::findOrFail($id);

        $student->update([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'status' => $request->status,
        ]);

        // Update course enrollment if course_id is provided
        if ($request->course_id) {
            // Detach from all courses first
            $student->courses()->detach();
            // Attach to the new course
            $student->courses()->attach($request->course_id);
        } else {
            // If no course_id is provided, detach from all courses
            $student->courses()->detach();
        }

        // Update payment status
        $payment = Payment::where('student_id', $student->id)->first();
        if ($payment) {
            $payment->update(['status' => $request->payment_status]);
        } else {
            // Create a new payment record if none exists
            Payment::create([
                'student_id' => $student->id,
                'status' => $request->payment_status,
                'amount' => 0, // You can adjust this as needed
                'payment_date' => now(),
            ]);
        }

        return response()->json([
            'message' => 'Student updated successfully',
            'student' => $student
        ]);
    }

    // Delete a student
    public function destroy($id)
    {
        $student = Student::findOrFail($id);

        // Detach from all courses before deleting
        $student->courses()->detach();
        
        // Delete all payments for this student
        Payment::where('student_id', $student->id)->delete();

        $student->delete();

        return response()->json([
            'message' => 'Student deleted successfully'
        ]);
    }

    // Ban a student
    public function ban($id)
    {
        $student = Student::findOrFail($id);
        $student->update(['status' => 'banned']);

        return response()->json([
            'message' => 'Student banned successfully'
        ]);
    }

    // Unban a student
    public function unban($id)
    {
        $student = Student::findOrFail($id);
        $student->update(['status' => 'active']);

        return response()->json([
            'message' => 'Student unbanned successfully'
        ]);
    }

    // Update payment status
    public function updatePaymentStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,completed',
        ]);

        // Find the student
        $student = Student::findOrFail($id);

        // Find or create a payment record for this student
        $payment = Payment::firstOrCreate(
            ['student_id' => $student->id],
            [
                'amount' => 0, // You can adjust this as needed
                'payment_date' => now(),
            ]
        );

        // Update the payment status
        $payment->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Payment status updated successfully'
        ]);
    }

    // Change student's course
    public function changeCourse(Request $request, $id)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
        ]);

        $student = Student::findOrFail($id);

        // Detach from all courses first
        $student->courses()->detach();

        // Attach to the new course
        $student->courses()->attach($request->course_id);

        return response()->json([
            'message' => 'Student course changed successfully'
        ]);
    }

    // Enroll student in a course
    public function enrollStudentInCourse(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'course_id' => 'required|exists:courses,id',
        ]);

        $student = Student::findOrFail($request->student_id);

        // Check if student is already enrolled in the course
        if ($student->courses()->where('course_id', $request->course_id)->exists()) {
            return response()->json([
                'message' => 'Student is already enrolled in this course'
            ], 400);
        }

        // Enroll the student in the course
        $student->courses()->attach($request->course_id);

        return response()->json([
            'message' => 'Student enrolled in course successfully'
        ]);
    }
}
