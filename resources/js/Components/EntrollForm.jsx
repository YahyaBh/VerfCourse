// src/components/EnrollForm.js
import React, { useState } from 'react';
import axios from 'axios';

const EnrollForm = () => {
    const [studentId, setStudentId] = useState('');
    const [courseId, setCourseId] = useState(1); // Assuming course ID 1 for Full Stack Web Development

    const handleEnroll = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/student/enroll', {
                student_id: studentId,
                course_id: courseId,
            });
            alert('Student enrolled in course successfully');
        } catch (error) {
            alert('Error enrolling student');
        }
    };

    return (
        <form onSubmit={handleEnroll}>
            <input
                type="text"
                placeholder="Student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
            />
            <button type="submit">Enroll in Course</button>
        </form>
    );
};

export default EnrollForm;
