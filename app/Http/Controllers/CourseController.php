<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;

class CourseController extends Controller
{
    // Get all courses with student count
    public function index()
    {
        $courses = Course::withCount('students')->get();
        return Inertia::render('Admin/Courses', ['courses' => $courses]);
    }

    // Store a new course
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration' => 'nullable|max:50',
            'instructor' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $course = Course::create([
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'duration' => $request->duration,
            'instructor' => $request->instructor,
            'is_active' => $request->is_active ?? true,
        ]);

        return redirect()->back()->with('success', 'Course created successfully');
    }

    // Update a course
    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration' => 'nullable|string|max:50',
            'instructor' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $course->update([
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'duration' => $request->duration,
            'instructor' => $request->instructor,
            'is_active' => $request->is_active ?? true,
        ]);

        return redirect()->back()->with('success', 'Course updated successfully');
    }

    // Delete a course
    public function destroy($id)
    {
        $course = Course::findOrFail($id);

        // Check if there are students enrolled in this course
        if ($course->students()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete course with enrolled students');
        }

        $course->delete();

        return redirect()->back()->with('success', 'Course deleted successfully');
    }

    // Toggle course active status
    public function toggleActive(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $course->is_active = $request->is_active;
        $course->save();

        return redirect()->back()->with('success', 'Course status updated successfully');
    }
}
