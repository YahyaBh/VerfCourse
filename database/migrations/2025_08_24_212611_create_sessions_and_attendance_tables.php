<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Sessions for a course (like "Day 1", "Day 2")
        Schema::create('course_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->date('session_date');
            $table->string('topic')->nullable();
            $table->timestamps();
        });

        Schema::create('attendance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_session_id')
                ->constrained('course_sessions')
                ->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['present', 'absent', 'late'])->default('present');
            $table->timestamps();

            $table->unique(['course_session_id', 'student_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance');
        Schema::dropIfExists('sessions');
    }
};
