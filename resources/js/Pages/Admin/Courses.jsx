import React, { useState, useEffect } from "react";
import { router, Head } from "@inertiajs/react";
import toast from "react-hot-toast";
import AdminSidebar from "@/Components/AdminSidebar";
import axios from "axios";
import moment from "moment";

const Courses = ({ courses }) => {
    const [coursesList, setCoursesList] = useState(courses || []);
    const [filteredCourses, setFilteredCourses] = useState(courses || []);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newCourse, setNewCourse] = useState({
        name: "",
        description: "",
        price: 0.00,
        duration: "",
        instructor: "",
        is_active: true,
    });
    const [selectedCourse, setSelectedCourse] = useState(null);

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);

        const filtered = coursesList.filter((course) => {
            return (
                course.name.toLowerCase().includes(value) ||
                (course.instructor && course.instructor.toLowerCase().includes(value)) ||
                (course.description && course.description.toLowerCase().includes(value))
            );
        });
        setFilteredCourses(filtered);
    };

    const handleAdd = () => {
        setNewCourse({
            name: "",
            description: "",
            price: 0.00,
            duration: "",
            instructor: "",
            is_active: true,
        });
        setIsAdding(true);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post("/api/course/create", newCourse);

            if (response.status === 201) {
                toast.success("Course created successfully!");
                setIsAdding(false);
                // Add the new course to the list
                const createdCourse = response.data.course;
                setCoursesList([...coursesList, createdCourse]);
                setFilteredCourses([...filteredCourses, createdCourse]);
            } else {
                toast.error("Error creating course.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error creating course.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (course) => {
        setSelectedCourse(course);
        setNewCourse({
            name: course.name,
            description: course.description,
            price: course.price,
            duration: course.duration,
            instructor: course.instructor,
            is_active: course.is_active,
        });
        setIsEditing(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.put(`/api/course/update/${selectedCourse.id}`, newCourse);

            if (response.status === 200) {
                toast.success("Course updated successfully!");
                setIsEditing(false);
                setSelectedCourse(null);
                // Update the course in the list
                setCoursesList(
                    coursesList.map((course) =>
                        course.id === selectedCourse.id ? { ...course, ...newCourse } : course
                    )
                );
                setFilteredCourses(
                    filteredCourses.map((course) =>
                        course.id === selectedCourse.id ? { ...course, ...newCourse } : course
                    )
                );
            } else {
                toast.error("Error updating course.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error updating course.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (courseId) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;

        setLoading(true);
        try {
            await axios.delete(`/api/course/${courseId}`);
            toast.success("Course deleted successfully");
            setCoursesList(coursesList.filter((course) => course.id !== courseId));
            setFilteredCourses(filteredCourses.filter((course) => course.id !== courseId));
        } catch (error) {
            toast.error("Error deleting course");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (courseId) => {
        setLoading(true);
        try {
            const course = coursesList.find(c => c.id === courseId);
            const newStatus = !course.is_active;

            await axios.put(`/api/course/toggle-active/${courseId}`, {
                is_active: newStatus
            });

            toast.success(`Course ${newStatus ? 'activated' : 'deactivated'} successfully`);

            setCoursesList(
                coursesList.map((course) =>
                    course.id === courseId ? { ...course, is_active: newStatus } : course
                )
            );
            setFilteredCourses(
                filteredCourses.map((course) =>
                    course.id === courseId ? { ...course, is_active: newStatus } : course
                )
            );
        } catch (error) {
            toast.error("Error updating course status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head title="Admin Courses" />
            <div className="flex min-h-screen bg-[#2d2d2d] text-white">
                {/* Sidebar */}
                <AdminSidebar activeItem="Courses" />

                {/* Main content area */}
                <main className="flex-1 overflow-y-auto p-6">
                    {/* Top bar */}
                    <div className="flex justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-[#FFE662]">Manage Courses</h1>
                            <p className="text-gray-400">Manage and view all your courses</p>
                        </div>
                        <button
                            onClick={handleAdd}
                            className="bg-[#FFE662] text-black py-2 px-4 rounded-lg hover:bg-[#ffd94c] transition-all"
                        >
                            Add New Course
                        </button>
                    </div>

                    {/* Search bar */}
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="p-3 w-full bg-[#3a3a3a] rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFE662]"
                        />
                    </div>

                    {/* Courses Table */}
                    {loading ? (
                        <p>Loading courses...</p>
                    ) : (
                        <table className="min-w-full text-left text-gray-300">
                            <thead className="border-b border-gray-600">
                                <tr>
                                    <th className="py-3 px-4">Course ID</th>
                                    <th className="py-3 px-4">Name</th>
                                    <th className="py-3 px-4">Instructor</th>
                                    <th className="py-3 px-4">Price</th>
                                    <th className="py-3 px-4">Duration</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCourses.map((course) => (
                                    <tr key={course.id} className="border-b border-gray-600 hover:bg-[#444]">
                                        <td className="py-3 px-4">{course.id}</td>
                                        <td className="py-3 px-4">{course.name}</td>
                                        <td className="py-3 px-4">{course.instructor || '-'}</td>
                                        <td className="py-3 px-4">${course.price.toFixed(2)}</td>
                                        <td className="py-3 px-4">{course.duration || '-'}</td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-3 py-1 rounded-full ${course.is_active ? "bg-green-500" : "bg-red-500"} text-white`}
                                            >
                                                {course.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 flex space-x-3">
                                            <button
                                                onClick={() => handleEdit(course)}
                                                className="bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-all"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleToggleActive(course.id)}
                                                className={`${course.is_active ? "bg-red-600" : "bg-green-600"} text-white py-2 px-4 rounded-lg hover:opacity-80 transition-all`}
                                            >
                                                {course.is_active ? "Deactivate" : "Activate"}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(course.id)}
                                                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-all"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCourses.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="py-4 text-center text-gray-400">
                                            No courses found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </main>
            </div>

            {/* Modal for Add Course */}
            {isAdding && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-[#333] p-8 rounded-xl w-96">
                        <h3 className="text-2xl font-semibold text-[#FFE662] mb-6">
                            Add New Course
                        </h3>
                        <form onSubmit={handleCreate}>
                            <div className="mb-4">
                                <label className="block text-gray-400">Course Name</label>
                                <input
                                    type="text"
                                    value={newCourse.name}
                                    onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200 placeholder-gray-400"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400">Description</label>
                                <textarea
                                    value={newCourse.description}
                                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200 placeholder-gray-400"
                                    rows="3"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400">Price ($)</label>
                                <input
                                    type="number"
                                    value={newCourse.price}
                                    onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) || 0 })}
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200 placeholder-gray-400"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400">Duration</label>
                                <input
                                    type="text"
                                    value={newCourse.duration}
                                    onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200 placeholder-gray-400"
                                    placeholder="e.g., 8 weeks, 3 months"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400">Instructor</label>
                                <input
                                    type="text"
                                    value={newCourse.instructor}
                                    onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200 placeholder-gray-400"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="flex items-center text-gray-400">
                                    <input
                                        type="checkbox"
                                        checked={newCourse.is_active}
                                        onChange={(e) => setNewCourse({ ...newCourse, is_active: e.target.checked })}
                                        className="mr-2"
                                    />
                                    Active
                                </label>
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
                                    {!loading ? "Add Course" : "Processing..."}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Edit Course */}
            {isEditing && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-[#333] p-8 rounded-xl w-96">
                        <h3 className="text-2xl font-semibold text-[#FFE662] mb-6">
                            Edit Course
                        </h3>
                        <form onSubmit={handleUpdate}>
                            <div className="mb-4">
                                <label className="block text-gray-400">Course Name</label>
                                <input
                                    type="text"
                                    value={newCourse.name}
                                    onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200 placeholder-gray-400"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400">Description</label>
                                <textarea
                                    value={newCourse.description}
                                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200 placeholder-gray-400"
                                    rows="3"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400">Price ($)</label>
                                <input
                                    type="number"
                                    value={newCourse.price}
                                    onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) || 0 })}
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200 placeholder-gray-400"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400">Duration</label>
                                <input
                                    type="text"
                                    value={newCourse.duration}
                                    onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200 placeholder-gray-400"
                                    placeholder="e.g., 8 weeks, 3 months"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400">Instructor</label>
                                <input
                                    type="text"
                                    value={newCourse.instructor}
                                    onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200 placeholder-gray-400"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="flex items-center text-gray-400">
                                    <input
                                        type="checkbox"
                                        checked={newCourse.is_active}
                                        onChange={(e) => setNewCourse({ ...newCourse, is_active: e.target.checked })}
                                        className="mr-2"
                                    />
                                    Active
                                </label>
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
                                    {!loading ? "Update Course" : "Processing..."}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Courses;
