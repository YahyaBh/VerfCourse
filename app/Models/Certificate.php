<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    


    protected $fillable = [
        'student_name',
        'course_name',
        'certificate_number',
        'issued_date',
        'course_link',
        'pdf_file_path',
    ];

    public function getRouteKeyName()
    {
        return 'certificate_number';
    }
}
