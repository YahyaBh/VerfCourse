<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Course;
use App\Models\StudentCourse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;

class StudentController extends Controller
{
    // Get all students with their courses
    public function index()
    {
        $students = Student::with('courses')->get();
        $courses = Course::all();

        return Inertia::render('Admin/Students', [
            'students' => $students,
            'courses' => $courses
        ]);
    }

    // Store a new student
    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:students,email',
            'dob' => 'nullable|date',
            'phone_number' => 'nullable|string|max:20',
            'status' => 'required|in:active,banned',
            'payment_status' => 'required|in:pending,completed',
        ]);

        $student = Student::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'dob' => $request->dob,
            'phone_number' => $request->phone_number,
            'status' => $request->status,
            'payment_status' => $request->payment_status,
        ]);

        // If course_id is provided, enroll the student in the course
        if ($request->has('course_id') && $request->course_id) {
            $this->enrollStudentInCourse($request->merge(['student_id' => $student->id]));
        }

        return response()->json([
            'message' => 'Student created successfully', 
            'student' => $student
        ], Response::HTTP_CREATED);
    }

    // Update a student
    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);
        
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:students,email,' . $id,
            'dob' => 'nullable|date',
            'phone_number' => 'nullable|string|max:20',
            'status' => 'required|in:active,banned',
            'payment_status' => 'required|in:pending,completed',
        ]);

        $student->update([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'dob' => $request->dob,
            'phone_number' => $request->phone_number,
            'status' => $request->status,
            'payment_status' => $request->payment_status,
        ]);

        return response()->json([
            'message' => 'Student updated successfully', 
            'student' => $student
        ], Response::HTTP_OK);
    }

    // Delete a student
    public function destroy($id)
    {
        $student = Student::findOrFail($id);
        
        // Remove all course enrollments for this student
        StudentCourse::where('student_id', $id)->delete();
        
        $student->delete();
        
        return response()->json([
            'message' => 'Student deleted successfully'
        ], Response::HTTP_OK);
    }

    // Ban a student
    public function ban($id)
    {
        $student = Student::findOrFail($id);
        $student->status = 'banned';
        $student->save();
        
        return response()->json([
            'message' => 'Student banned successfully',
            'student' => $student
        ], Response::HTTP_OK);
    }

    // Unban a student
    public function unban($id)
    {
        $student = Student::findOrFail($id);
        $student->status = 'active';
        $student->save();
        
        return response()->json([
            'message' => 'Student unbanned successfully',
            'student' => $student
        ], Response::HTTP_OK);
    }

    // Update payment status
    public function updatePaymentStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,completed',
        ]);
        
        $student = Student::findOrFail($id);
        $student->payment_status = $request->status;
        $student->save();
        
        return response()->json([
            'message' => 'Payment status updated successfully',
            'student' => $student
        ], Response::HTTP_OK);
    }

    // Enroll student in a course
    public function enrollStudentInCourse(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'course_id' => 'required|exists:courses,id',
        ]);

        // Check if the student is already enrolled in this course
        $existingEnrollment = StudentCourse::where('student_id', $request->student_id)
            ->where('course_id', $request->course_id)
            ->first();
            
        if ($existingEnrollment) {
            return response()->json([
                'message' => 'Student is already enrolled in this course'
            ], Response::HTTP_CONFLICT);
        }

        $studentCourse = StudentCourse::create([
            'student_id' => $request->student_id,
            'course_id' => $request->course_id,
            'weekly_quizzes_score' => 0,
            'exercises_score' => 0,
            'final_project_score' => 0,
            'participation_score' => 0,
            'total_score' => 0,
            'grade' => null,
        ]);

        return response()->json([
            'message' => 'Student enrolled successfully in the course', 
            'student_course' => $studentCourse
        ], Response::HTTP_OK);
    }

    // Update student grades
    public function updateGrades(Request $request, $studentCourseId)
    {
        $request->validate([
            'weekly_quizzes_score' => 'required|numeric|min:0',
            'exercises_score' => 'required|numeric|min:0',
            'final_project_score' => 'required|numeric|min:0',
            'participation_score' => 'required|numeric|min:0',
        ]);

        $studentCourse = StudentCourse::findOrFail($studentCourseId);

        $studentCourse->weekly_quizzes_score = $request->weekly_quizzes_score;
        $studentCourse->exercises_score = $request->exercises_score;
        $studentCourse->final_project_score = $request->final_project_score;
        $studentCourse->participation_score = $request->participation_score;

        $totalScore = $this->calculateTotalScore($studentCourse);
        $studentCourse->total_score = $totalScore;
        $studentCourse->grade = $this->assignGrade($totalScore);

        $studentCourse->save();

        return response()->json([
            'message' => 'Grades updated successfully',
            'student_course' => $studentCourse,
        ], Response::HTTP_OK);
    }

    // Calculate the total score for the student
    private function calculateTotalScore($studentCourse)
    {
        $totalScore = 0;

        // Weekly Quizzes: 40% of the total
        $totalScore += ($studentCourse->weekly_quizzes_score / 130) * 0.4 * 100;

        // Exercises & Assignments: 20% of the total
        $totalScore += ($studentCourse->exercises_score / 50) * 0.2 * 100;

        // Final Project: 30% of the total
        $totalScore += ($studentCourse->final_project_score / 25) * 0.3 * 100;

        // Participation & Attendance: 10% of the total
        $totalScore += ($studentCourse->participation_score / 10) * 0.1 * 100;

        return $totalScore;
    }

    // Assign letter grade based on total score
    private function assignGrade($totalScore)
    {
        if ($totalScore >= 90) {
            return 'A';
        } elseif ($totalScore >= 80) {
            return 'B';
        } elseif ($totalScore >= 70) {
            return 'C';
        } elseif ($totalScore >= 60) {
            return 'D';
        } else {
            return 'F';
        }
    }
}
