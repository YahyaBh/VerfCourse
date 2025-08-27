<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Course;
use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    // List sessions for a course
    public function index(Course $course)
    {
        $sessions = $course->sessions()
            ->with(['attendances.student'])
            ->orderBy('session_date')
            ->get();

        // Calculate statistics
        $stats = [
            'totalSessions' => $sessions->count(),
            'totalPresent' => 0,
            'totalAbsent' => 0,
            'totalLate' => 0,
            'monthlyAttendance' => array_fill(0, 12, 0),
        ];

        foreach ($sessions as $session) {
            $month = date('n', strtotime($session->session_date)) - 1;
            $stats['monthlyAttendance'][$month]++;

            foreach ($session->attendances as $attendance) {
                switch ($attendance->status) {
                    case 'present':
                        $stats['totalPresent']++;
                        break;
                    case 'absent':
                        $stats['totalAbsent']++;
                        break;
                    case 'late':
                        $stats['totalLate']++;
                        break;
                }
            }
        }

        return Inertia::render('Admin/Attendance', [
            'course' => $course,
            'sessions' => $sessions,
            'students' => $course->students,
            'stats' => $stats,
        ]);
    }

    // Create a new session
    public function storeSession(Request $request, Course $course)
    {
        $data = $request->validate([
            'session_date' => ['required', 'date'],
            'topic' => ['nullable', 'string', 'max:255'],
        ]);

        $session = new Session();
        $session->course_id = $course->id;
        $session->session_date = $data['session_date'];
        $session->topic = $data['topic'];
        $session->save();

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
        $request->validate(['status' => 'required|in:present,absent,late']);
        $attendance->update(['status' => $request->status]);

        return back()->with('success', 'Attendance updated');
    }

    // Get all attendance records for a session
    public function getSessionAttendance(Session $session)
    {
        return response()->json([
            'session' => $session,
            'attendances' => $session->attendances()->with('student')->get()
        ]);
    }

    // Bulk update attendance for a session
    public function bulkUpdateAttendance(Request $request, Session $session)
    {
        $data = $request->validate([
            'attendances' => ['required', 'array'],
            'attendances.*.id' => ['required', 'exists:attendances,id'],
            'attendances.*.status' => ['required', 'in:present,absent,late'],
        ]);

        foreach ($data['attendances'] as $attendanceData) {
            $attendance = Attendance::find($attendanceData['id']);
            if ($attendance && $attendance->session_id === $session->id) {
                $attendance->update(['status' => $attendanceData['status']]);
            }
        }

        return back()->with('success', 'Attendance updated for all students');
    }

    // Delete a session and its attendance records
    public function deleteSession(Session $session)
    {
        DB::transaction(function () use ($session) {
            $session->attendances()->delete();
            $session->delete();
        });

        return back()->with('success', 'Session deleted');
    }

    // Get attendance report for a course
    public function getAttendanceReport(Course $course)
    {
        $report = [];
        $students = $course->students;

        foreach ($students as $student) {
            $studentStats = [
                'student' => $student,
                'totalSessions' => 0,
                'present' => 0,
                'absent' => 0,
                'late' => 0,
                'attendancePercentage' => 0,
            ];

            foreach ($course->sessions as $session) {
                $attendance = $session->attendances()
                    ->where('student_id', $student->id)
                    ->first();

                if ($attendance) {
                    $studentStats['totalSessions']++;
                    $studentStats[$attendance->status]++;
                }
            }

            if ($studentStats['totalSessions'] > 0) {
                $studentStats['attendancePercentage'] = round(
                    ($studentStats['present'] / $studentStats['totalSessions']) * 100,
                    2
                );
            }

            $report[] = $studentStats;
        }

        return response()->json($report);
    }
}
