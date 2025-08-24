<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;

class CourseController extends Controller
{
    // Get all courses
    public function index()
    {
        $courses = Course::all();
        return Inertia::render('Admin/Courses', ['courses' => $courses]);
    }

    // Store a new course
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration' => 'nullable|string|max:50',
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

        return response()->json([
            'message' => 'Course created successfully',
            'course' => $course
        ], Response::HTTP_CREATED);
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

        return response()->json([
            'message' => 'Course updated successfully',
            'course' => $course
        ], Response::HTTP_OK);
    }

    // Delete a course
    public function destroy($id)
    {
        $course = Course::findOrFail($id);

        // Check if there are students enrolled in this course
        if ($course->students()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete course with enrolled students'
            ], Response::HTTP_CONFLICT);
        }

        $course->delete();

        return response()->json([
            'message' => 'Course deleted successfully'
        ], Response::HTTP_OK);
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

        return response()->json([
            'message' => 'Course status updated successfully',
            'course' => $course
        ], Response::HTTP_OK);
    }
}
