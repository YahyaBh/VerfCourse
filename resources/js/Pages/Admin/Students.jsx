import React, { useState, useEffect } from "react";
import { router, Head } from "@inertiajs/react";
import toast from "react-hot-toast";
import AdminSidebar from "@/Components/AdminSidebar";
import axios from "axios";
import moment from "moment";

const Students = ({ students, courses }) => {
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

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);

        const filtered = studentsList.filter((student) => {
            return (
                student.first_name.toLowerCase().includes(value) ||
                student.last_name.toLowerCase().includes(value) ||
                student.email.toLowerCase().includes(value) ||
                (student.course_name && student.course_name.toLowerCase().includes(value))
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

    return (
        <>
            <Head title="Admin Students" />
            <div className="flex min-h-screen bg-[#2d2d2d] text-white">
                {/* Sidebar */}
                <AdminSidebar activeItem="Students" />

                {/* Main content area */}
                <main className="flex-1 overflow-y-auto p-6">
                    {/* Top bar */}
                    <div className="flex justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-[#FFE662]">Manage Students</h1>
                            <p className="text-gray-400">Manage and view all your students</p>
                        </div>
                        <button
                            onClick={handleAdd}
                            className="bg-[#FFE662] text-black py-2 px-4 rounded-lg hover:bg-[#ffd94c] transition-all"
                        >
                            Add New Student
                        </button>
                    </div>

                    {/* Search bar */}
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="p-3 w-full bg-[#3a3a3a] rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFE662]"
                        />
                    </div>

                    {/* Students Table */}
                    {loading ? (
                        <p>Loading students...</p>
                    ) : (
                        <table className="min-w-full text-left text-gray-300">
                            <thead className="border-b border-gray-600">
                                <tr>
                                    <th className="py-3 px-4">Student ID</th>
                                    <th className="py-3 px-4">Name</th>
                                    <th className="py-3 px-4">Email</th>
                                    <th className="py-3 px-4">Course</th>
                                    <th className="py-3 px-4">Payment Status</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="border-b border-gray-600 hover:bg-[#444]">
                                        <td className="py-3 px-4">{student.id}</td>
                                        <td className="py-3 px-4">{student.first_name} {student.last_name}</td>
                                        <td className="py-3 px-4">{student.email}</td>
                                        <td className="py-3 px-4">{student.course_name || '-'}</td>
                                        <td className="py-3 px-4">
                                            <select
                                                value={paymentStatus[student.id] || student.payment_status}
                                                onChange={(e) =>
                                                    handlePaymentStatusChange(student.id, e.target.value)
                                                }
                                                className="bg-[#3a3a3a] text-gray-200 rounded p-1"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-3 py-1 rounded-full ${student.status === "banned" ? "bg-red-500" : "bg-green-500"} text-white`}
                                            >
                                                {student.status === "banned" ? "Banned" : "Active"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 flex space-x-3">
                                            <button
                                                onClick={() => handleEdit(student)}
                                                className="bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-all"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    student.status === "banned"
                                                        ? handleUnban(student.id)
                                                        : handleBan(student.id)
                                                }
                                                className="bg-[#FFE662] text-black py-2 px-4 rounded-lg hover:bg-[#ffd94c] transition-all"
                                            >
                                                {student.status === "banned" ? "Unban" : "Ban"}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(student.id)}
                                                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-all"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="py-4 text-center text-gray-400">
                                            No students found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </main>
            </div>

            {/* Modal for Add Student */}
            {isAdding && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-[#333] p-8 rounded-xl w-96">
                        <h3 className="text-2xl font-semibold text-[#FFE662] mb-6">
                            Add New Student
                        </h3>
                        <form onSubmit={handleCreate}>
                            <div className="mb-4">
                                <label className="block text-gray-400">First Name</label>
                                <input
                                    type="text"
                                    value={newStudent.first_name}
                                    onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200 placeholder-gray-400"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400">Last Name</label>
                                <input
                                    type="text"
                                    value={newStudent.last_name}
                                    onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200 placeholder-gray-400"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400">Email</label>
                                <input
                                    type="email"
                                    value={newStudent.email}
                                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200 placeholder-gray-400"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400">Course</label>
                                <select
                                    value={newStudent.course_id}
                                    onChange={(e) => setNewStudent({ ...newStudent, course_id: e.target.value })}
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200"
                                    required
                                >
                                    <option value="">Select a course</option>
                                    {courses && courses.map(course => (
                                        <option key={course.id} value={course.id}>{course.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400">Status</label>
                                <select
                                    value={newStudent.status}
                                    onChange={(e) => setNewStudent({ ...newStudent, status: e.target.value })}
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200"
                                >
                                    <option value="active">Active</option>
                                    <option value="banned">Banned</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400">Payment Status</label>
                                <select
                                    value={newStudent.payment_status}
                                    onChange={(e) => setNewStudent({ ...newStudent, payment_status: e.target.value })}
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="bg-gray-600 text-white py-2 px-4 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-[#FFE662] text-black py-2 px-4 rounded-lg hover:bg-[#ffd94c] transition-all disabled:opacity-10"
                                >
                                    {!loading ? "Add Student" : "Processing..."}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Edit Student */}
            {isEditing && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-[#333] p-8 rounded-xl w-96">
                        <h3 className="text-2xl font-semibold text-[#FFE662] mb-6">
                            Edit Student
                        </h3>
                        <form onSubmit={handleUpdate}>
                            <div className="mb-4">
                                <label className="block text-gray-400">First Name</label>
                                <input
                                    type="text"
                                    value={newStudent.first_name}
                                    onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200 placeholder-gray-400"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400">Last Name</label>
                                <input
                                    type="text"
                                    value={newStudent.last_name}
                                    onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200 placeholder-gray-400"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400">Email</label>
                                <input
                                    type="email"
                                    value={newStudent.email}
                                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200 placeholder-gray-400"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400">Course</label>
                                <select
                                    value={newStudent.course_id}
                                    onChange={(e) => setNewStudent({ ...newStudent, course_id: e.target.value })}
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200"
                                    required
                                >
                                    <option value="">Select a course</option>
                                    {courses && courses.map(course => (
                                        <option key={course.id} value={course.id}>{course.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400">Status</label>
                                <select
                                    value={newStudent.status}
                                    onChange={(e) => setNewStudent({ ...newStudent, status: e.target.value })}
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200"
                                >
                                    <option value="active">Active</option>
                                    <option value="banned">Banned</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400">Payment Status</label>
                                <select
                                    value={newStudent.payment_status}
                                    onChange={(e) => setNewStudent({ ...newStudent, payment_status: e.target.value })}
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="bg-gray-600 text-white py-2 px-4 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-[#FFE662] text-black py-2 px-4 rounded-lg hover:bg-[#ffd94c] transition-all disabled:opacity-10"
                                >
                                    {!loading ? "Update Student" : "Processing..."}
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
