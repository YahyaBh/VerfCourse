<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'duration',
        'instructor',
        'is_active'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function students()
    {
        return $this->belongsToMany(Student::class, 'course_student')
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


    public function sessions()
    {
        return $this->hasMany(Session::class);
    }
}
