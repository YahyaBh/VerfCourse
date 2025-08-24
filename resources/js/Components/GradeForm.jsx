// src/components/GradeForm.js
import React, { useState } from 'react';
import axios from 'axios';

const GradeForm = ({ studentCourseId }) => {
    const [grades, setGrades] = useState({
        weekly_quizzes_score: 0,
        exercises_score: 0,
        final_project_score: 0,
        participation_score: 0,
    });

    const handleUpdateGrades = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.put(`http://127.0.0.1:8000/api/student/grade/${studentCourseId}`, grades);
            alert('Grades updated successfully');
        } catch (error) {
            alert('Error updating grades');
        }
    };

    return (
        <form onSubmit={handleUpdateGrades}>
            <input
                type="number"
                placeholder="Weekly Quizzes Score"
                value={grades.weekly_quizzes_score}
                onChange={(e) => setGrades({ ...grades, weekly_quizzes_score: e.target.value })}
            />
            <input
                type="number"
                placeholder="Exercises Score"
                value={grades.exercises_score}
                onChange={(e) => setGrades({ ...grades, exercises_score: e.target.value })}
            />
            <input
                type="number"
                placeholder="Final Project Score"
                value={grades.final_project_score}
                onChange={(e) => setGrades({ ...grades, final_project_score: e.target.value })}
            />
            <input
                type="number"
                placeholder="Participation Score"
                value={grades.participation_score}
                onChange={(e) => setGrades({ ...grades, participation_score: e.target.value })}
            />
            <button type="submit">Update Grades</button>
        </form>
    );
};

export default GradeForm;
