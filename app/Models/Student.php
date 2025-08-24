<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'dob',
        'phone_number',
        'status',
        'payment_status'
    ];

    protected $casts = [
        'dob' => 'date',
        'status' => 'string',
        'payment_status' => 'string',
    ];

    public function courses()
    {
        return $this->belongsToMany(Course::class, 'course_student')
            ->withPivot([
                'weekly_quizzes_score',
                'exercises_score',
                'final_project_score',
                'participation_score',
                'total_score',
                'grade'
            ])
            ->withTimestamps();
    }
}
