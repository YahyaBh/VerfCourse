import React, { useState, useEffect } from "react";
import { router, Head } from "@inertiajs/react";
import toast from "react-hot-toast";
import AdminSidebar from "@/Components/AdminSidebar";
import axios from "axios";
import moment from "moment";

const Students = ({ students, courses, studentCourses }) => {
    const [studentsList, setStudentsList] = useState(students || []);
    const [filteredStudents, setFilteredStudents] = useState(students || []);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newStudent, setNewStudent] = useState({
        first_name: "",
        last_name: "",
        email: "",
        status: "active",
        course_id: "",
        payment_status: "pending",
    });
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState({});

    useEffect(() => {
        // Initialize payment status from the students data
        const initialPaymentStatus = {};
        students.forEach(student => {
            initialPaymentStatus[student.id] = student.payment_status;
        });
        setPaymentStatus(initialPaymentStatus);
    }, [students]);

    // Helper function to get course name by student ID
    const getCourseNameByStudentId = (studentId) => {
        // Find the student's course enrollment in the studentCourses array
        const studentCourse = studentCourses.find(sc => sc.student_id === studentId);
        
        if (!studentCourse) return 'No course assigned';
        
        // Find the course in the courses array using the course_id from studentCourse
        const course = courses.find(c => c.id === studentCourse.course_id);
        return course ? course.name : 'Unknown course';
    };

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);

        const filtered = studentsList.filter((student) => {
            const courseName = getCourseNameByStudentId(student.id);
            return (
                student.first_name.toLowerCase().includes(value) ||
                student.last_name.toLowerCase().includes(value) ||
                student.email.toLowerCase().includes(value) ||
                (courseName && courseName.toLowerCase().includes(value))
            );
        });
        setFilteredStudents(filtered);
    };

    const handleAdd = () => {
        setNewStudent({
            first_name: "",
            last_name: "",
            email: "",
            status: "active",
            course_id: "",
            payment_status: "pending",
        });
        setIsAdding(true);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post("/api/student/create", newStudent);

            if (response.status === 201) {
                toast.success("Student created successfully!");
                setIsAdding(false);
                // Add the new student to the list
                const createdStudent = response.data.student;
                setStudentsList([...studentsList, createdStudent]);
                setFilteredStudents([...filteredStudents, createdStudent]);

                // Initialize payment status for the new student
                setPaymentStatus(prev => ({
                    ...prev,
                    [createdStudent.id]: createdStudent.payment_status
                }));
            } else {
                toast.error("Error creating student.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error creating student.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (student) => {
        setSelectedStudent(student);
        setNewStudent({
            first_name: student.first_name,
            last_name: student.last_name,
            email: student.email,
            status: student.status,
            course_id: student.course_id,
            payment_status: student.payment_status,
        });
        setIsEditing(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.put(`/api/student/update/${selectedStudent.id}`, newStudent);

            if (response.status === 200) {
                toast.success("Student updated successfully!");
                setIsEditing(false);
                setSelectedStudent(null);
                // Update the student in the list
                setStudentsList(
                    studentsList.map((student) =>
                        student.id === selectedStudent.id ? { ...student, ...newStudent } : student
                    )
                );
                setFilteredStudents(
                    filteredStudents.map((student) =>
                        student.id === selectedStudent.id ? { ...student, ...newStudent } : student
                    )
                );
            } else {
                toast.error("Error updating student.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error updating student.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (studentId) => {
        if (!window.confirm("Are you sure you want to delete this student?")) return;

        setLoading(true);
        try {
            await axios.delete(`/api/student/${studentId}`);
            toast.success("Student deleted successfully");
            setStudentsList(studentsList.filter((student) => student.id !== studentId));
            setFilteredStudents(filteredStudents.filter((student) => student.id !== studentId));
        } catch (error) {
            toast.error("Error deleting student");
        } finally {
            setLoading(false);
        }
    };

    const handleBan = async (studentId) => {
        setLoading(true);
        try {
            await axios.put(`/api/student/ban/${studentId}`);
            toast.success("Student banned!");
            setStudentsList(
                studentsList.map((student) =>
                    student.id === studentId ? { ...student, status: "banned" } : student
                )
            );
            setFilteredStudents(
                filteredStudents.map((student) =>
                    student.id === studentId ? { ...student, status: "banned" } : student
                )
            );
        } catch (error) {
            toast.error("Error banning student");
        } finally {
            setLoading(false);
        }
    };

    const handleUnban = async (studentId) => {
        setLoading(true);
        try {
            await axios.put(`/api/student/unban/${studentId}`);
            toast.success("Student unbanned!");
            setStudentsList(
                studentsList.map((student) =>
                    student.id === studentId ? { ...student, status: "active" } : student
                )
            );
            setFilteredStudents(
                filteredStudents.map((student) =>
                    student.id === studentId ? { ...student, status: "active" } : student
                )
            );
        } catch (error) {
            toast.error("Error unbanning student");
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentStatusChange = async (studentId, status) => {
        try {
            const response = await axios.put(`/api/student/payment-status/${studentId}`, {
                status,
            });
            setPaymentStatus((prevStatus) => ({
                ...prevStatus,
                [studentId]: status,
            }));
            setStudentsList(
                studentsList.map((student) =>
                    student.id === studentId ? { ...student, payment_status: status } : student
                )
            );
            setFilteredStudents(
                filteredStudents.map((student) =>
                    student.id === studentId ? { ...student, payment_status: status } : student
                )
            );
            toast.success(`Payment status updated to ${status}`);
        } catch (error) {
            toast.error("Error updating payment status");
        }
    };

    const handleChangeCourse = async (studentId, newCourseId) => {
        try {
            const response = await axios.put(`/api/student/change-course/${studentId}`, {
                course_id: newCourseId,
            });
            setStudentsList(
                studentsList.map((student) =>
                    student.id === studentId ? { ...student, course_id: newCourseId } : student
                )
            );
            setFilteredStudents(
                filteredStudents.map((student) =>
                    student.id === studentId ? { ...student, course_id: newCourseId } : student
                )
            );
            toast.success("Student course changed successfully");
        } catch (error) {
            toast.error("Error changing course");
        }
    };

    const viewStudentDetails = (studentId) => {
        router.visit(`/admin/students/${studentId}`);
    };

    // Get status color
    const getStatusColor = (status) => {
        return status === 'banned' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400';
    };

    // Get payment status color
    const getPaymentStatusColor = (status) => {
        return status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400';
    };

    return (
        <>
            <Head title="Admin Students" />
            <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
                {/* Sidebar */}
                <AdminSidebar activeItem="Students" />

                {/* Main content area */}
                <main className="flex-1 overflow-y-auto p-6">
                    {/* Top bar */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                                Manage Students
                            </h1>
                            <p className="text-gray-400 mt-2">Manage and view all your students</p>
                        </div>
                        <button
                            onClick={handleAdd}
                            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add New Student
                        </button>
                    </div>

                    {/* Search bar */}
                    <div className="mb-8">
                        <div className="relative max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Students Table */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                        </div>
                    ) : (
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-700">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-700">
                                    <thead className="bg-gray-800/50">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Student ID
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Course
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Payment Status
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {filteredStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-gray-800/30 transition-colors duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">
                                                    {student.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-white font-bold">
                                                            {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-white">
                                                                {student.first_name} {student.last_name}
                                                            </div>
                                                            <div className="text-sm text-gray-400">
                                                                {student.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {student.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {getCourseNameByStudentId(student.id)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={paymentStatus[student.id] || student.payment_status}
                                                        onChange={(e) =>
                                                            handlePaymentStatusChange(student.id, e.target.value)
                                                        }
                                                        className="bg-gray-700 border border-gray-600 text-gray-200 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="completed">Completed</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(student.status)}`}>
                                                        {student.status === "banned" ? "Banned" : "Active"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={() => viewStudentDetails(student.id)}
                                                            className="text-blue-500 hover:text-blue-400 transition-colors duration-200"
                                                            title="View Details"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(student)}
                                                            className="text-yellow-500 hover:text-yellow-400 transition-colors duration-200"
                                                            title="Edit"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                student.status === "banned"
                                                                    ? handleUnban(student.id)
                                                                    : handleBan(student.id)
                                                            }
                                                            className={`${student.status === "banned" ? "text-green-500 hover:text-green-400" : "text-yellow-500 hover:text-yellow-400"} transition-colors duration-200`}
                                                            title={student.status === "banned" ? "Unban" : "Ban"}
                                                        >
                                                            {student.status === "banned" ? (
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                                </svg>
                                                            ) : (
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(student.id)}
                                                            className="text-red-500 hover:text-red-400 transition-colors duration-200"
                                                            title="Delete"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredStudents.length === 0 && (
                                <div className="text-center py-12">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-400">No students found</h3>
                                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search or create a new student.</p>
                                    <div className="mt-6">
                                        <button
                                            onClick={handleAdd}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Add New Student
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Modal for Add Student */}
            {isAdding && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
                    <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 border border-gray-700">
                        <h3 className="text-2xl font-bold text-white mb-6">
                            Add New Student
                        </h3>
                        <form onSubmit={handleCreate}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        value={newStudent.first_name}
                                        onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        value={newStudent.last_name}
                                        onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={newStudent.email}
                                        onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Course</label>
                                    <select
                                        value={newStudent.course_id}
                                        onChange={(e) => setNewStudent({ ...newStudent, course_id: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    >
                                        <option value="">Select a course</option>
                                        {courses && courses.map(course => (
                                            <option key={course.id} value={course.id}>
                                                {course.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Status</label>
                                    <select
                                        value={newStudent.status}
                                        onChange={(e) => setNewStudent({ ...newStudent, status: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="banned">Banned</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Payment Status</label>
                                    <select
                                        value={newStudent.payment_status}
                                        onChange={(e) => setNewStudent({ ...newStudent, payment_status: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-between mt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg transition-all duration-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-medium py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50"
                                >
                                    {loading ? "Processing..." : "Add Student"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Edit Student */}
            {isEditing && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
                    <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 border border-gray-700">
                        <h3 className="text-2xl font-bold text-white mb-6">
                            Edit Student
                        </h3>
                        <form onSubmit={handleUpdate}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        value={newStudent.first_name}
                                        onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        value={newStudent.last_name}
                                        onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={newStudent.email}
                                        onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Course</label>
                                    <select
                                        value={newStudent.course_id}
                                        onChange={(e) => setNewStudent({ ...newStudent, course_id: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    >
                                        <option value="">Select a course</option>
                                        {courses && courses.map(course => (
                                            <option key={course.id} value={course.id}>
                                                {course.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Status</label>
                                    <select
                                        value={newStudent.status}
                                        onChange={(e) => setNewStudent({ ...newStudent, status: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="banned">Banned</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Payment Status</label>
                                    <select
                                        value={newStudent.payment_status}
                                        onChange={(e) => setNewStudent({ ...newStudent, payment_status: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-between mt-8">
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
                                    {loading ? "Processing..." : "Update Student"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Students;
