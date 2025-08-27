<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentCourse extends Model
{
    use HasFactory;

protected $table = 'student_course';


    protected $fillable = [
        'student_id',
        'course_id',
        'weekly_quizzes_score',
        'exercises_score',
        'final_project_score',
        'participation_score',
        'total_score',
        'grade',
    ];

    protected $casts = [
        'weekly_quizzes_score' => 'integer',
        'exercises_score' => 'integer',
        'final_project_score' => 'integer',
        'participation_score' => 'integer',
        'total_score' => 'integer',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
