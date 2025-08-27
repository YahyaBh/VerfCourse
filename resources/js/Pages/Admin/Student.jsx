import React, { useState, useEffect } from "react";
import { router, Head } from "@inertiajs/react";
import toast from "react-hot-toast";
import AdminSidebar from "@/Components/AdminSidebar";
import axios from "axios";
import moment from "moment";

const StudentDetails = ({ student, courses = [], studentGrades = [], paymentStatus }) => {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [gradesArray, setGradesArray] = useState([]);

    // Debug the raw studentGrades prop
    useEffect(() => {
        console.log('Raw studentGrades prop:', studentGrades);
        console.log('Type of studentGrades:', typeof studentGrades);
        console.log('Is studentGrades an array?', Array.isArray(studentGrades));
        console.log('Length of studentGrades:', studentGrades.length);
        console.log('Payment status from props:', paymentStatus);
    }, [studentGrades, paymentStatus]);

    // Add this with your other console.log statements
    useEffect(() => {
        console.log('Student prop:', student);
        console.log('Student ID:', student?.id);
    }, [student]);

    // Set the grades array directly from studentGrades
    useEffect(() => {
        // Make sure studentGrades is an array
        if (Array.isArray(studentGrades)) {
            setGradesArray(studentGrades);
            console.log('Set grades array directly from studentGrades:', studentGrades);
        } else {
            // If it's not an array, try to convert it
            try {
                if (studentGrades && typeof studentGrades === 'object') {
                    const grades = Object.values(studentGrades);
                    setGradesArray(grades);
                    console.log('Converted object to array:', grades);
                } else {
                    setGradesArray([]);
                    console.log('Invalid studentGrades format, setting empty array');
                }
            } catch (error) {
                console.error('Error processing studentGrades:', error);
                setGradesArray([]);
            }
        }
    }, [studentGrades]);

    const handleEditCourse = (courseId) => {
        const courseData = gradesArray.find(g => g.id === courseId);
        if (courseData) {
            setSelectedCourse(courseId);
            setCourseScores({
                weekly_quizzes_score: courseData.pivot?.weekly_quizzes_score || 0,
                exercises_score: courseData.pivot?.exercises_score || 0,
                final_project_score: courseData.pivot?.final_project_score || 0,
                participation_score: courseData.pivot?.participation_score || 0,
                total_score: courseData.pivot?.total_score || 0,
                grade: courseData.pivot?.grade || 'F'
            });
            setIsEditing(true);
        }
    };

    const [courseScores, setCourseScores] = useState({
        weekly_quizzes_score: 0,
        exercises_score: 0,
        final_project_score: 0,
        participation_score: 0,
        total_score: 0,
        grade: 'F'
    });

    const handleUpdateScores = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await router.put(`/admin/students/${student.id}/grades`, {
                grades: {
                    [selectedCourse]: courseScores
                }
            });

            if (response.status === 200) {
                toast.success("Course scores updated successfully!");
                setIsEditing(false);
                setSelectedCourse(null);
                // Update local grades state
                setGradesArray(prevGradesArray =>
                    prevGradesArray.map(course =>
                        course.id === selectedCourse
                            ? {
                                ...course,
                                pivot: {
                                    ...course.pivot,
                                    ...courseScores
                                }
                            }
                            : course
                    )
                );
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
        // Each category is out of 25 points, so total possible is 100 points
        const totalPoints = (weekly_quizzes_score || 0) + (exercises_score || 0) + (final_project_score || 0) + (participation_score || 0);
        // Convert to percentage (it's already effectively a percentage since max is 100)
        return Math.round(totalPoints);
    };

    const assignGrade = (totalScore) => {
        if (totalScore >= 90) return 'A';
        if (totalScore >= 80) return 'B';
        if (totalScore >= 70) return 'C';
        if (totalScore >= 60) return 'D';
        return 'F';
    };

    const handleScoreChange = (field, value) => {
        // Parse the value as a float
        const numValue = parseFloat(value) || 0;
        
        // Update the specific score field
        const updatedScores = { ...courseScores, [field]: numValue };
        
        // Calculate the new total score
        const { weekly_quizzes_score, exercises_score, final_project_score, participation_score } = updatedScores;
        const totalPoints = (weekly_quizzes_score || 0) + (exercises_score || 0) + (final_project_score || 0) + (participation_score || 0);
        const totalScore = Math.round(totalPoints);
        
        // Calculate the new grade based on the total score
        const grade = assignGrade(totalScore);
        
        // Update the state with all the new values
        setCourseScores({
            ...updatedScores,
            total_score: totalScore,
            grade: grade
        });
    };

    // Get courses the student is not enrolled in
    const enrolledCourseIds = gradesArray && gradesArray.length > 0 ? gradesArray.map(g => g.id) : [];
    const availableCourses = courses.filter(course =>
        !enrolledCourseIds.includes(course.id)
    );

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

    // Helper function to get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case 'active':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                );
            case 'banned':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return null;
        }
    };

    // Helper function to get payment status icon
    const getPaymentStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                );
            case 'pending':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Head title={`Student Details - ${student.first_name} ${student.last_name}`} />
            <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
                <AdminSidebar activeItem="Students" />
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
                                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center space-x-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                                <span>Back to Students</span>
                            </button>
                        </div>
                    </div>

                    {/* Student Information Card */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-gray-700">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                            <div className="mb-6 md:mb-0">
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-black">
                                        {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-yellow-500">
                                            {student.first_name} {student.last_name}
                                        </h2>
                                        <p className="text-gray-400">{student.email}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-3">
                                {student.status === 'active' ? (
                                    <button
                                        onClick={handleBanStudent}
                                        className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center space-x-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                        </svg>
                                        <span>Ban Student</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleUnbanStudent}
                                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center space-x-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Unban Student</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="bg-gray-700/50 rounded-xl p-4 transition-all hover:bg-gray-700/70">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                        <h3 className="text-sm font-medium text-gray-400">Contact Information</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-gray-400 text-sm">Email:</span>
                                            <span className="text-white">{student.email}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-gray-400 text-sm">Phone:</span>
                                            <span className="text-white">{student.phone_number || 'Not provided'}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-gray-400 text-sm">Date of Birth:</span>
                                            <span className="text-white">{student.dob ? moment(student.dob).format('MMMM D, YYYY') : 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-gray-700/50 rounded-xl p-4 transition-all hover:bg-gray-700/70">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                        <h3 className="text-sm font-medium text-gray-400">Account Status</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-sm">Status:</span>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${student.status === 'banned' ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                                                    {getStatusIcon(student.status)}
                                                    <span>{student.status === 'banned' ? "Banned" : "Active"}</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-sm">Payment Status:</span>
                                            <div className="flex items-center space-x-2">
                                                <select
                                                    value={paymentStatus || 'pending'}
                                                    onChange={(e) => handleUpdatePaymentStatus(e.target.value)}
                                                    className={`px-3 py-1 rounded-lg text-sm font-medium ${paymentStatus === 'completed' ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}
                                                >
                                                    <option value="pending" className="bg-gray-800">Pending</option>
                                                    <option value="completed" className="bg-gray-800">Completed</option>
                                                </select>
                                                {getPaymentStatusIcon(paymentStatus || 'pending')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Courses Section */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-yellow-500 flex items-center space-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                                </svg>
                                <span>Enrolled Courses</span>
                            </h2>
                            <div className="relative">
                                <select
                                    onChange={(e) => e.target.value && handleEnrollInCourse(parseInt(e.target.value))}
                                    className="bg-gray-800 text-gray-200 rounded-lg py-2 pl-10 pr-4 appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-500 border border-gray-700"
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

                        {!gradesArray || gradesArray.length === 0 ? (
                            <div className="bg-gray-800/50 backdrop-blur-sm p-12 rounded-xl text-center border border-gray-700">
                                <div className="flex justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-medium text-gray-300 mb-2">No Courses Found</h3>
                                <p className="text-gray-400 mb-4">This student is not enrolled in any courses yet.</p>
                                <div className="text-gray-500 text-sm mb-4">
                                    <p>Debug: Number of grades: {gradesArray?.length || 0}</p>
                                    <p>Debug: Raw studentGrades type: {typeof studentGrades}</p>
                                    <p>Debug: Is studentGrades an array? {Array.isArray(studentGrades) ? 'Yes' : 'No'}</p>
                                    <p>Debug: Length of studentGrades: {studentGrades?.length || 0}</p>
                                    <p>Debug: Payment status: {paymentStatus || 'Not available'}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        if (!student || !student.id) {
                                            toast.error("Student information is not available");
                                            return;
                                        }

                                        setLoading(true);
                                        axios.get(`/api/student/${student.id}/courses`)
                                            .then(response => {
                                                console.log('Manually fetched courses:', response.data);
                                                setGradesArray(response.data);
                                                setLoading(false);
                                            })
                                            .catch(error => {
                                                console.error('Error fetching courses:', error);
                                                setLoading(false);
                                                toast.error('Error fetching courses');
                                            });
                                    }}
                                    disabled={loading}
                                    className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-black py-2 px-4 rounded-lg transition-all duration-300 flex items-center space-x-2 mx-auto"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Fetching...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                            </svg>
                                            <span>Fetch Courses Manually</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {gradesArray.map((courseStudent) => (
                                    <div key={courseStudent.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-700 overflow-hidden">
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-yellow-500 mb-1">
                                                        {courseStudent.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-400">Instructor: {courseStudent.instructor || 'Not specified'}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleEditCourse(courseStudent.id)}
                                                    className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded-lg transition-all duration-300"
                                                    title="Edit Scores"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-400 text-sm">Grade:</span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getGradeColor(courseStudent.pivot?.grade)}`}>
                                                        {courseStudent.pivot?.grade || 'Not graded'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-400 text-sm">Total Score:</span>
                                                    <span className="text-white font-medium">{courseStudent.pivot?.total_score || 0}%</span>
                                                </div>
                                                
                                                <div className="pt-2 border-t border-gray-700">
                                                    <h4 className="text-sm font-medium text-gray-400 mb-2">Score Breakdown:</h4>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="bg-gray-700/50 rounded-lg p-2">
                                                            <p className="text-xs text-gray-400">Weekly Quizzes</p>
                                                            <p className="text-white font-medium">{courseStudent.pivot?.weekly_quizzes_score || 0}%</p>
                                                        </div>
                                                        <div className="bg-gray-700/50 rounded-lg p-2">
                                                            <p className="text-xs text-gray-400">Exercises</p>
                                                            <p className="text-white font-medium">{courseStudent.pivot?.exercises_score || 0}%</p>
                                                        </div>
                                                        <div className="bg-gray-700/50 rounded-lg p-2">
                                                            <p className="text-xs text-gray-400">Final Project</p>
                                                            <p className="text-white font-medium">{courseStudent.pivot?.final_project_score || 0}%</p>
                                                        </div>
                                                        <div className="bg-gray-700/50 rounded-lg p-2">
                                                            <p className="text-xs text-gray-400">Participation</p>
                                                            <p className="text-white font-medium">{courseStudent.pivot?.participation_score || 0}%</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Edit Course Scores Modal */}
                    {isEditing && selectedCourse && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 border border-gray-700">
                                <h3 className="text-2xl font-semibold text-yellow-500 mb-6 flex items-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>Edit Course Scores</span>
                                </h3>
                                <form onSubmit={handleUpdateScores}>
                                    <div className="mb-4">
                                        <label className="block text-gray-400 mb-2">Course</label>
                                        <div className="bg-gray-700 p-3 rounded-lg">
                                            <p className="font-medium">{gradesArray.find(g => g.id === selectedCourse)?.name}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-gray-400 mb-2">Weekly Quizzes Score (max: 25)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="25"
                                                    value={courseScores.weekly_quizzes_score}
                                                    onChange={(e) => handleScoreChange('weekly_quizzes_score', e.target.value)}
                                                    className="w-full p-3 bg-gray-700 rounded-lg text-gray-200"
                                                />
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                                                    /25
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-gray-400 mb-2">Exercises Score (max: 25)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="25"
                                                    value={courseScores.exercises_score}
                                                    onChange={(e) => handleScoreChange('exercises_score', e.target.value)}
                                                    className="w-full p-3 bg-gray-700 rounded-lg text-gray-200"
                                                />
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                                                    /25
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
                                                    className="w-full p-3 bg-gray-700 rounded-lg text-gray-200"
                                                />
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                                                    /25
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-gray-400 mb-2">Participation Score (max: 25)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="25"
                                                    value={courseScores.participation_score}
                                                    onChange={(e) => handleScoreChange('participation_score', e.target.value)}
                                                    className="w-full p-3 bg-gray-700 rounded-lg text-gray-200"
                                                />
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                                                    /25
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6 mt-8">
                                        <label className="block text-gray-400 mb-2">Total Score & Grade</label>
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-1 bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 p-3 rounded-lg border border-yellow-600/30">
                                                <span className="text-xl font-bold text-yellow-500">{courseScores.total_score}%</span>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-white font-medium ${getGradeColor(courseScores.grade)}`}>
                                                {courseScores.grade}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-all duration-300"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-yellow-600 hover:bg-yellow-700 text-black py-2 px-4 rounded-lg transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>Processing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Update Scores</span>
                                                </>
                                            )}
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
