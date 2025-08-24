import React, { useState, useEffect } from "react";
import { router, Head } from "@inertiajs/react";
import toast from "react-hot-toast";
import AdminSidebar from "@/Components/AdminSidebar";
import axios from "axios";
import moment from "moment";

const StudentDetails = ({ student, courses, studentCourses }) => {
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

    // Get grade color
    const getGradeColor = (grade) => {
        switch (grade) {
            case 'A': return 'bg-green-500';
            case 'B': return 'bg-blue-500';
            case 'C': return 'bg-yellow-500';
            case 'D': return 'bg-orange-500';
            case 'F': return 'bg-red-500';
            default: return 'bg-gray-500';
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
                            <p className="text-gray-400 mt-2">View and manage student information</p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => router.visit('/admin/students')}
                                className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-6 rounded-lg transition-all duration-300 flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Students
                            </button>
                        </div>
                    </div>

                    {/* Student Information Card */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-gray-700">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                            <div className="flex items-center space-x-6">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-2xl font-bold text-white">
                                    {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-1">
                                        {student.first_name} {student.last_name}
                                    </h2>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${student.status === 'banned' ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                                            {student.status === 'banned' ? "Banned" : "Active"}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${student.payment_status === 'completed' ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                                            {student.payment_status === 'completed' ? "Payment Completed" : "Payment Pending"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-3">
                                {student.status === 'active' ? (
                                    <button
                                        onClick={handleBanStudent}
                                        className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
                                        Ban Student
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleUnbanStudent}
                                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        Unban Student
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                            <div className="bg-gray-700/50 p-4 rounded-xl">
                                <p className="text-gray-400 text-sm">Email</p>
                                <p className="font-medium text-white mt-1">{student.email}</p>
                            </div>
                            <div className="bg-gray-700/50 p-4 rounded-xl">
                                <p className="text-gray-400 text-sm">Phone</p>
                                <p className="font-medium text-white mt-1">{student.phone_number || 'Not provided'}</p>
                            </div>
                            <div className="bg-gray-700/50 p-4 rounded-xl">
                                <p className="text-gray-400 text-sm">Date of Birth</p>
                                <p className="font-medium text-white mt-1">{student.dob ? moment(student.dob).format('MMMM D, YYYY') : 'Not provided'}</p>
                            </div>
                            <div className="bg-gray-700/50 p-4 rounded-xl">
                                <p className="text-gray-400 text-sm">Payment Status</p>
                                <div className="flex items-center mt-1">
                                    <select
                                        value={student.payment_status}
                                        onChange={(e) => handleUpdatePaymentStatus(e.target.value)}
                                        className="bg-gray-600 text-white rounded p-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Courses Section */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                                Enrolled Courses
                            </h2>
                            <div className="relative">
                                <select
                                    onChange={(e) => e.target.value && handleEnrollInCourse(parseInt(e.target.value))}
                                    className="bg-gray-800 text-white rounded-lg py-3 pl-12 pr-4 appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-500 w-64"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Enroll in Course</option>
                                    {availableCourses.map(course => (
                                        <option key={course.id} value={course.id}>
                                            {course.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {studentCourses.length === 0 ? (
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <p className="text-gray-400 text-lg">This student is not enrolled in any courses yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {studentCourses.map((courseStudent) => (
                                    <div key={courseStudent.id} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 overflow-hidden">
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-xl font-bold text-white">
                                                    {courseStudent.course?.name || 'Unknown Course'}
                                                </h3>
                                                <button
                                                    onClick={() => handleEditCourse(courseStudent)}
                                                    className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded-lg transition-all duration-300"
                                                    title="Edit Scores"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-sm text-gray-400">Instructor</p>
                                                    <p className="font-medium text-white">{courseStudent.course?.instructor || 'Not specified'}</p>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-gray-400">Grade</p>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getGradeColor(courseStudent.grade)}`}>
                                                            {courseStudent.grade || 'Not graded'}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-400">Total Score</p>
                                                        <p className="font-bold text-xl text-white">{courseStudent.total_score || 0}%</p>
                                                    </div>
                                                </div>

                                                <div className="pt-2 border-t border-gray-700">
                                                    <p className="text-sm text-gray-400">Enrollment Date</p>
                                                    <p className="font-medium text-white">{moment(courseStudent.created_at).format('MMMM D, YYYY')}</p>
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
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
                            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 border border-gray-700">
                                <h3 className="text-2xl font-bold text-white mb-6">
                                    Edit Course Scores
                                </h3>
                                <form onSubmit={handleUpdateScores}>
                                    <div className="mb-6">
                                        <label className="block text-gray-400 mb-2">Course</label>
                                        <p className="font-medium text-lg text-yellow-500">{selectedCourse.course?.name || 'Unknown Course'}</p>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <label className="block text-gray-400 mb-2">Weekly Quizzes Score (max: 130)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="130"
                                                    value={courseScores.weekly_quizzes_score}
                                                    onChange={(e) => handleScoreChange('weekly_quizzes_score', e.target.value)}
                                                    className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                                />
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                                    /130
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-gray-400 mb-2">Exercises Score (max: 50)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="50"
                                                    value={courseScores.exercises_score}
                                                    onChange={(e) => handleScoreChange('exercises_score', e.target.value)}
                                                    className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                                />
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                                    /50
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-gray-400 mb-2">Final Project Score (max: 25)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="25"
                                                    value={courseScores.final_project_score}
                                                    onChange={(e) => handleScoreChange('final_project_score', e.target.value)}
                                                    className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                                />
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                                    /25
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-gray-400 mb-2">Participation Score (max: 10)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="10"
                                                    value={courseScores.participation_score}
                                                    onChange={(e) => handleScoreChange('participation_score', e.target.value)}
                                                    className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                                />
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                                    /10
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-gray-400 mb-2">Total Score & Grade</label>
                                        <div className="flex items-center justify-between bg-gray-700 rounded-lg p-4">
                                            <div className="text-2xl font-bold text-white">
                                                {courseScores.total_score}%
                                            </div>
                                            <span className={`px-4 py-2 rounded-full text-lg font-bold text-white ${getGradeColor(courseScores.grade)}`}>
                                                {courseScores.grade || 'Not graded'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg transition-all duration-300"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-medium py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50"
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
