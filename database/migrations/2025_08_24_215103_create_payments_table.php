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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();

            $table->decimal('amount', 10, 2); // monthly fee
            $table->enum('method', ['cash', 'card', 'bank_transfer'])->default('cash');
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');

            $table->date('payment_for_month'); // tracks which month this payment is for
            $table->string('reference')->nullable(); // optional bank reference
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
