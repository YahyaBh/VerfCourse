import React, { useEffect, useState } from "react";
import axios from "axios";

const Student = ({ studentId }) => {
    const [studentInfo, setStudentInfo] = useState(null);
    const [studentCourse, setStudentCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch student information and their course data
    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                // Fetch student data
                const studentResponse = await axios.get(
                    `http://127.0.0.1:8000/api/student/${studentId}`
                );
                setStudentInfo(studentResponse.data);

                // Fetch student course data (grades, performance)
                const courseResponse = await axios.get(
                    `http://127.0.0.1:8000/api/student/courses/${studentId}`
                );
                setStudentCourse(courseResponse.data);
            } catch (error) {
                console.error("Error fetching student data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, [studentId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!studentInfo || !studentCourse) {
        return <div>No data available for this student.</div>;
    }

    // Calculate the student's total score and grade
    const totalScore = studentCourse.total_score;
    const grade = studentCourse.grade;

    // Get the breakdown of the student's score
    const quizScorePercentage = (studentCourse.weekly_quizzes_score / 130) * 40;
    const exercisesScorePercentage = (studentCourse.exercises_score / 50) * 20;
    const finalProjectScorePercentage = (studentCourse.final_project_score / 25) * 30;
    const participationScorePercentage = (studentCourse.participation_score / 10) * 10;

    return (
        <div className="student-page">
            <h1>Student Information & Analysis</h1>
            <div className="student-info">
                <h2>{studentInfo.first_name} {studentInfo.last_name}</h2>
                <p><strong>Email:</strong> {studentInfo.email}</p>
                <p><strong>Date of Birth:</strong> {studentInfo.dob}</p>
                <p><strong>Phone Number:</strong> {studentInfo.phone_number || "N/A"}</p>
                <p><strong>Status:</strong> {studentInfo.status}</p>
            </div>

            <div className="course-info">
                <h3>Course Enrollment</h3>
                <p><strong>Course Name:</strong> Full Stack Web Development</p>

                <div className="grade-analysis">
                    <h3>Grade Breakdown</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Component</th>
                                <th>Max Points</th>
                                <th>Score</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Weekly Quizzes</td>
                                <td>130</td>
                                <td>{studentCourse.weekly_quizzes_score}</td>
                                <td>{quizScorePercentage}%</td>
                            </tr>
                            <tr>
                                <td>Exercises & Assignments</td>
                                <td>50</td>
                                <td>{studentCourse.exercises_score}</td>
                                <td>{exercisesScorePercentage}%</td>
                            </tr>
                            <tr>
                                <td>Final Project</td>
                                <td>25</td>
                                <td>{studentCourse.final_project_score}</td>
                                <td>{finalProjectScorePercentage}%</td>
                            </tr>
                            <tr>
                                <td>Participation & Attendance</td>
                                <td>10</td>
                                <td>{studentCourse.participation_score}</td>
                                <td>{participationScorePercentage}%</td>
                            </tr>
                            <tr>
                                <td><strong>Total Score</strong></td>
                                <td><strong>215</strong></td>
                                <td><strong>{totalScore}</strong></td>
                                <td><strong>{totalScore}%</strong></td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="final-grade">
                        <h3>Final Grade: {grade}</h3>
                        {grade === "A" && <p>Accredited</p>}
                        {grade === "B" && <p>Accredited</p>}
                        {grade === "C" && <p>Conditional Accreditation</p>}
                        {grade === "F" && <p>Not Accredited</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Student;
