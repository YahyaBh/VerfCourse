<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Course;
use App\Models\Session;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    // List sessions for a course
    public function index(Course $course)
    {
        $course->load('sessions.attendance.student');
        return Inertia::render('Admin/Attendance', [
            'course' => $course,
            'sessions' => $course->sessions()->with('attendance.student')->orderBy('session_date')->get(),
        ]);
    }

    // Create a new session
    public function storeSession(Request $request, Course $course)
    {
        $data = $request->validate([
            'session_date' => ['required', 'date'],
            'topic' => ['nullable', 'string', 'max:255'],
        ]);
        $session = $course->sessions()->create($data);

        // auto-create attendance records as 'absent' for enrolled students
        foreach ($course->students as $student) {
            Attendance::create([
                'session_id' => $session->id,
                'student_id' => $student->id,
                'status' => 'absent',
            ]);
        }

        return back()->with('success', 'Session created');
    }

    // Update attendance for a student
    public function updateAttendance(Request $request, Session $session, Attendance $attendance)
    {
        $this->authorize('update', $attendance); // optional policy

        $request->validate(['status' => 'required|in:present,absent,late']);
        $attendance->update(['status' => $request->status]);

        return back()->with('success', 'Attendance updated');
    }
}
