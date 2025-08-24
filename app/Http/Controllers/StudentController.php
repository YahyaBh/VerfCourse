<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;

class StudentController extends Controller
{
    // Get all students with their course information
    public function index()
    {
        $students = Student::all();
        $courses = Course::all();

        // Get all student-course relationships
        $studentCourses = \DB::table('course_student')->get();

        return Inertia::render('Admin/Students', [
            'students' => $students,
            'courses' => $courses,
            'studentCourses' => $studentCourses
        ]);
    }

    // Get a specific student with their course information
    public function show($id)
    {
        $student = Student::findOrFail($id);
        $courses = Course::all();
        $studentCourses = $student->courses()->withPivot(['weekly_quizzes_score', 'exercises_score', 'final_project_score', 'participation_score', 'total_score', 'grade'])->get();

        return Inertia::render('Admin/StudentDetails', [
            'student' => $student,
            'courses' => $courses,
            'studentCourses' => $studentCourses
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
            'payment_status' => $request->payment_status,
        ]);

        // If a course_id is provided, enroll the student in the course
        if ($request->course_id) {
            $student->courses()->attach($request->course_id);
        }

        return response()->json([
            'message' => 'Student created successfully',
            'student' => $student
        ]);
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
            'payment_status' => $request->payment_status,
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

        $student = Student::findOrFail($id);
        $student->update(['payment_status' => $request->status]);

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
