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
        Schema::create('student_course', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->integer('weekly_quizzes_score')->default(0);
            $table->integer('exercises_score')->default(0);
            $table->integer('final_project_score')->default(0);
            $table->integer('participation_score')->default(0);
            $table->integer('total_score')->default(0);
            $table->string('grade')->nullable();
            $table->timestamps();

            // Ensure a student can't enroll in the same course twice
            $table->unique(['student_id', 'course_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('student_course');
        Schema::enableForeignKeyConstraints();
    }
};
