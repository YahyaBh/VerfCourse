<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = ['payment_id', 'invoice_number', 'issued_date'];

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    public function student()
    {
        return $this->hasOneThrough(Student::class, Payment::class, 'id', 'id', 'payment_id', 'student_id');
    }

    public function course()
    {
        return $this->hasOneThrough(Course::class, Payment::class, 'id', 'id', 'payment_id', 'course_id');
    }
}
