import React, { useState, useEffect } from "react";
import { router, Head } from "@inertiajs/react";
import toast from "react-hot-toast";
import AdminSidebar from "@/Components/AdminSidebar";
import axios from "axios";
import moment from "moment";

const StudentDetails = ({ student, courses = [], studentCourses = [] }) => {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courseScores, setCourseScores] = useState({
        weekly_quizzes_score: 0,
        exercises_score: 0,
        final_project_score: 0,
        participation_score: 0,
        total_score: 0,
        grade: null,
    });

    useEffect(() => {
        // Initialize with student data
        if (student) {
            // Nothing specific needed here as we're using props
        }
    }, [student]);

    const handleEditCourse = (courseStudent) => {
        setSelectedCourse(courseStudent);
        setCourseScores({
            weekly_quizzes_score: courseStudent.weekly_quizzes_score || 0,
            exercises_score: courseStudent.exercises_score || 0,
            final_project_score: courseStudent.final_project_score || 0,
            participation_score: courseStudent.participation_score || 0,
            total_score: courseStudent.total_score || 0,
            grade: courseStudent.grade || null,
        });
        setIsEditing(true);
    };

    const handleUpdateScores = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.put(`/api/student/grade/${selectedCourse.id}`, courseScores);

            if (response.status === 200) {
                toast.success("Course scores updated successfully!");
                setIsEditing(false);
                setSelectedCourse(null);
                // Refresh the page to get updated data
                router.reload();
            } else {
                toast.error("Error updating course scores.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error updating course scores.");
        } finally {
            setLoading(false);
        }
    };

    const handleEnrollInCourse = async (courseId) => {
        setLoading(true);
        try {
            const response = await axios.post('/api/student/enroll', {
                student_id: student.id,
                course_id: courseId,
            });

            if (response.status === 200) {
                toast.success("Student enrolled in course successfully!");
                // Refresh the page to get updated data
                router.reload();
            } else {
                toast.error("Error enrolling student in course.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error enrolling student in course.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePaymentStatus = async (status) => {
        setLoading(true);
        try {
            const response = await axios.put(`/api/student/payment-status/${student.id}`, {
                status,
            });

            if (response.status === 200) {
                toast.success(`Payment status updated to ${status}`);
                // Refresh the page to get updated data
                router.reload();
            } else {
                toast.error("Error updating payment status.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error updating payment status.");
        } finally {
            setLoading(false);
        }
    };

    const handleBanStudent = async () => {
        if (!window.confirm("Are you sure you want to ban this student?")) return;

        setLoading(true);
        try {
            const response = await axios.put(`/api/student/ban/${student.id}`);

            if (response.status === 200) {
                toast.success("Student banned successfully!");
                // Refresh the page to get updated data
                router.reload();
            } else {
                toast.error("Error banning student.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error banning student.");
        } finally {
            setLoading(false);
        }
    };

    const handleUnbanStudent = async () => {
        if (!window.confirm("Are you sure you want to unban this student?")) return;

        setLoading(true);
        try {
            const response = await axios.put(`/api/student/unban/${student.id}`);

            if (response.status === 200) {
                toast.success("Student unbanned successfully!");
                // Refresh the page to get updated data
                router.reload();
            } else {
                toast.error("Error unbanning student.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error unbanning student.");
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalScore = () => {
        const { weekly_quizzes_score, exercises_score, final_project_score, participation_score } = courseScores;

        // Weekly Quizzes: 40% of the total
        const weeklyQuizzesPercentage = (weekly_quizzes_score / 130) * 0.4 * 100;

        // Exercises & Assignments: 20% of the total
        const exercisesPercentage = (exercises_score / 50) * 0.2 * 100;

        // Final Project: 30% of the total
        const finalProjectPercentage = (final_project_score / 25) * 0.3 * 100;

        // Participation & Attendance: 10% of the total
        const participationPercentage = (participation_score / 10) * 0.1 * 100;

        const totalScore = weeklyQuizzesPercentage + exercisesPercentage + finalProjectPercentage + participationPercentage;

        return Math.round(totalScore * 100) / 100; // Round to 2 decimal places
    };

    const assignGrade = (totalScore) => {
        if (totalScore >= 90) return 'A';
        if (totalScore >= 80) return 'B';
        if (totalScore >= 70) return 'C';
        if (totalScore >= 60) return 'D';
        return 'F';
    };

    const handleScoreChange = (field, value) => {
        const updatedScores = { ...courseScores, [field]: parseFloat(value) || 0 };

        // Calculate total score and grade
        const totalScore = calculateTotalScore();
        const grade = assignGrade(totalScore);

        setCourseScores({
            ...updatedScores,
            total_score: totalScore,
            grade: grade
        });
    };

    // Get courses the student is not enrolled in
    const availableCourses = courses.filter(course =>
        !studentCourses.some(sc => sc.course_id === course.id)
    );

    // Helper function to get course name by ID
    const getCourseName = (courseId) => {
        if (!courseId) return 'No Course';

        // First check if the course is in the courses array
        const course = courses.find(c => c.id === courseId);
        if (course) return course.name;

        // If not found, check if it's in the studentCourses array
        const studentCourse = studentCourses.find(sc => sc.course_id === courseId);
        if (studentCourse && studentCourse.course) {
            return studentCourse.course.name;
        }

        return 'Unknown Course';
    };

    // Helper function to get grade color
    const getGradeColor = (grade) => {
        switch (grade) {
            case 'A': return 'bg-green-600';
            case 'B': return 'bg-blue-600';
            case 'C': return 'bg-yellow-600';
            case 'D': return 'bg-orange-600';
            case 'F': return 'bg-red-600';
            default: return 'bg-gray-600';
        }
    };

    return (
        <>
            <Head title={`Student Details - ${student.first_name} ${student.last_name}`} />
            <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
                {/* Sidebar */}
                <AdminSidebar activeItem="Students" />

                {/* Main content area */}
                <main className="flex-1 overflow-y-auto p-6">
                    {/* Top bar */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                                Student Details
                            </h1>
                            <p className="text-gray-400">View and manage student information</p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => router.visit('/admin/students')}
                                className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-all"
                            >
                                Back to Students
                            </button>
                        </div>
                    </div>

                    {/* Student Information Card */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-gray-700">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-yellow-500 mb-2">
                                    {student.first_name} {student.last_name}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                                    <div>
                                        <p className="text-sm text-gray-400">Email</p>
                                        <p className="font-medium">{student.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Phone</p>
                                        <p className="font-medium">{student.phone_number || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Date of Birth</p>
                                        <p className="font-medium">{student.dob ? moment(student.dob).format('MMMM D, YYYY') : 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Status</p>
                                        <span className={`px-3 py-1 rounded-full ${student.status === 'banned' ? "bg-red-500" : "bg-green-500"} text-white`}>
                                            {student.status === 'banned' ? "Banned" : "Active"}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Payment Status</p>
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-3 py-1 rounded-full ${student.payment_status === 'completed' ? "bg-green-500" : "bg-yellow-500"} text-white`}>
                                                {student.payment_status === 'completed' ? "Completed" : "Pending"}
                                            </span>
                                            <select
                                                value={student.payment_status}
                                                onChange={(e) => handleUpdatePaymentStatus(e.target.value)}
                                                className="bg-gray-700 text-gray-200 rounded p-1 text-sm"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-3">
                                {student.status === 'active' ? (
                                    <button
                                        onClick={handleBanStudent}
                                        className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-all"
                                    >
                                        Ban Student
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleUnbanStudent}
                                        className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-all"
                                    >
                                        Unban Student
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Courses Section */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-yellow-500">Enrolled Courses</h2>
                            <div className="relative">
                                <select
                                    onChange={(e) => e.target.value && handleEnrollInCourse(parseInt(e.target.value))}
                                    className="bg-gray-800 text-gray-200 rounded-lg py-2 pl-10 pr-4 appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Enroll in Course</option>
                                    {availableCourses.map(course => (
                                        <option key={course.id} value={course.id}>
                                            {course.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {studentCourses.length === 0 ? (
                            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl text-center">
                                <p className="text-gray-400">This student is not enrolled in any courses yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {studentCourses.map((courseStudent) => (
                                    <div key={courseStudent.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-700">
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-xl font-bold text-yellow-500">
                                                    {getCourseName(courseStudent.id)}
                                                </h3>
                                                <button
                                                    onClick={() => handleEditCourse(courseStudent)}
                                                    className="bg-yellow-600 text-white p-2 rounded-lg hover:bg-yellow-700 transition-all"
                                                    title="Edit Scores"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="space-y-3 text-gray-300">
                                                <div>
                                                    <p className="text-sm text-gray-400">Instructor</p>
                                                    <p>{courseStudent.course?.instructor || 'Not specified'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">Grade</p>
                                                    <span className={`px-3 py-1 rounded-full text-white ${getGradeColor(courseStudent.grade)}`}>
                                                        {courseStudent.grade || 'Not graded'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">Total Score</p>
                                                    <p>{courseStudent.total_score || 0}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">Enrollment Date</p>
                                                    <p>{moment(courseStudent.created_at).format('MMMM D, YYYY')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Edit Course Scores Modal */}
                    {isEditing && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 border border-gray-700">
                                <h3 className="text-2xl font-semibold text-yellow-500 mb-6">
                                    Edit Course Scores
                                </h3>
                                <form onSubmit={handleUpdateScores}>
                                    <div className="mb-4">
                                        <label className="block text-gray-400 mb-2">Course</label>
                                        <p className="font-medium">{getCourseName(selectedCourse.course_id)}</p>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-400 mb-2">Weekly Quizzes Score (max: 130)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="130"
                                            value={courseScores.weekly_quizzes_score}
                                            onChange={(e) => handleScoreChange('weekly_quizzes_score', e.target.value)}
                                            className="w-full p-3 bg-gray-700 rounded-lg text-gray-200"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-400 mb-2">Exercises Score (max: 50)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="50"
                                            value={courseScores.exercises_score}
                                            onChange={(e) => handleScoreChange('exercises_score', e.target.value)}
                                            className="w-full p-3 bg-gray-700 rounded-lg text-gray-200"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-400 mb-2">Final Project Score (max: 25)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="25"
                                            value={courseScores.final_project_score}
                                            onChange={(e) => handleScoreChange('final_project_score', e.target.value)}
                                            className="w-full p-3 bg-gray-700 rounded-lg text-gray-200"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-400 mb-2">Participation Score (max: 10)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={courseScores.participation_score}
                                            onChange={(e) => handleScoreChange('participation_score', e.target.value)}
                                            className="w-full p-3 bg-gray-700 rounded-lg text-gray-200"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-400 mb-2">Total Score</label>
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-1 bg-gray-700 p-3 rounded-lg">
                                                {courseScores.total_score}%
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-white ${getGradeColor(courseScores.grade)}`}>
                                                {courseScores.grade || 'Not graded'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="bg-gray-700 text-white py-2 px-4 rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-yellow-600 text-black py-2 px-4 rounded-lg hover:bg-yellow-700 disabled:opacity-10"
                                        >
                                            {loading ? "Processing..." : "Update Scores"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};

export default StudentDetails;
