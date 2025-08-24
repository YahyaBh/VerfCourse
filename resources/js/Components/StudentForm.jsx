// src/components/StudentForm.js
import React, { useState } from 'react';
import axios from 'axios';

const StudentForm = () => {
    const [student, setStudent] = useState({
        first_name: '',
        last_name: '',
        email: '',
        dob: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/student/store', student);
            alert('Student Registered Successfully');
        } catch (error) {
            console.error(error);
            alert('Error registering student');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="First Name"
                value={student.first_name}
                onChange={(e) => setStudent({ ...student, first_name: e.target.value })}
            />
            <input
                type="text"
                placeholder="Last Name"
                value={student.last_name}
                onChange={(e) => setStudent({ ...student, last_name: e.target.value })}
            />
            <input
                type="email"
                placeholder="Email"
                value={student.email}
                onChange={(e) => setStudent({ ...student, email: e.target.value })}
            />
            <input
                type="date"
                placeholder="Date of Birth"
                value={student.dob}
                onChange={(e) => setStudent({ ...student, dob: e.target.value })}
            />
            <button type="submit">Register Student</button>
        </form>
    );
};

export default StudentForm;
