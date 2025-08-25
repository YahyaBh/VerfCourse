<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;

class CourseController extends Controller
{

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $courses = Course::withCount('students')->get();

        return Inertia::render('Admin/Courses', [
            'courses' => $courses
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration' => 'nullable|string|max:255',
            'instructor' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $course = Course::create($request->all());

        return redirect()->back()->with('success', 'Course created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $course = Course::with(['students', 'sessions', 'certificates'])->findOrFail($id);

        return Inertia::render('Admin/CourseDetail', [
            'course' => $course
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration' => 'nullable|string|max:255',
            'instructor' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $course = Course::findOrFail($id);
        $course->update($request->all());

        return redirect()->back()->with('success', 'Course updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $course = Course::findOrFail($id);
        $course->delete();

        return redirect()->back()->with('success', 'Course deleted successfully.');
    }

    /**
     * Toggle the active status of the specified resource.
     */
    public function toggleActive($id)
    {
        $course = Course::findOrFail($id);
        $course->is_active = !$course->is_active;
        $course->save();

        return redirect()->back()->with('success', 'Course status updated successfully.');
    }
}
