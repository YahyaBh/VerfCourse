<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Session extends Model
{
    protected $fillable = ['course_id', 'batch_id', 'session_date', 'topic'];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
    // public function batch()
    // {
    //     return $this->belongsTo(Batch::class);
    // } // if you have batches
    public function attendance()
    {
        return $this->hasMany(Attendance::class);
    }
}
