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
        return $this->belongsToMany(Student::class, 'student_course')
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

    public function certificates()
    {
        return $this->hasMany(Certificate::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    // Add a method to get the count of enrolled students
    public function getStudentsCountAttribute()
    {
        return $this->students()->count();
    }
}
