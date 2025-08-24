import React, { useState, useEffect } from "react";
import { router, Head } from "@inertiajs/react";
import toast from "react-hot-toast";
import AdminSidebar from "@/Components/AdminSidebar";
import axios from "axios";
import moment from "moment";

const Courses = ({ courses: initialCourses = [], students = [] }) => {
    const [courses, setCourses] = useState(initialCourses);
    const [filteredCourses, setFilteredCourses] = useState(initialCourses);
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

    useEffect(() => {
        setFilteredCourses(courses);
    }, [courses]);

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);

        const filtered = courses.filter((course) => {
            return (
                course.name.toLowerCase().includes(value) ||
                course.description.toLowerCase().includes(value) ||
                course.instructor.toLowerCase().includes(value)
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
            const response = await axios.post("/api/course/store", newCourse);

            if (response.status === 201) {
                toast.success("Course created successfully!");
                setIsAdding(false);
                setNewCourse({
                    name: "",
                    description: "",
                    price: 0.00,
                    duration: "",
                    instructor: "",
                    is_active: true,
                });
                // Refresh courses from server
                router.reload();
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
                setNewCourse({
                    name: "",
                    description: "",
                    price: 0.00,
                    duration: "",
                    instructor: "",
                    is_active: true,
                });
                // Refresh courses from server
                router.reload();
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

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;

        setLoading(true);
        try {
            await axios.delete(`/api/course/${id}`);
            toast.success("Course deleted successfully");
            setCourses(courses.filter((course) => course.id !== id));
            setFilteredCourses(filteredCourses.filter((course) => course.id !== id));
        } catch (error) {
            toast.error("Error deleting course");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (id) => {
        setLoading(true);
        try {
            const course = courses.find(c => c.id === id);
            const response = await axios.put(`/api/course/toggle-active/${id}`, {
                is_active: !course.is_active
            });

            if (response.status === 200) {
                toast.success(`Course ${!course.is_active ? 'activated' : 'deactivated'} successfully!`);
                setCourses(
                    courses.map((course) =>
                        course.id === id ? { ...course, is_active: !course.is_active } : course
                    )
                );
                setFilteredCourses(
                    filteredCourses.map((course) =>
                        course.id === id ? { ...course, is_active: !course.is_active } : course
                    )
                );
            } else {
                toast.error("Error updating course status.");
            }
        } catch (error) {
            toast.error("Error updating course status.");
        } finally {
            setLoading(false);
        }
    };

    // Get status color
    const getStatusColor = (isActive) => {
        return isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400';
    };

    return (
        <>
            <Head title="Admin Courses" />
            <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
                {/* Sidebar */}
                <AdminSidebar activeItem="Courses" />

                {/* Main content area */}
                <main className="flex-1 overflow-y-auto p-6">
                    {/* Top bar */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                                Manage Courses
                            </h1>
                            <p className="text-gray-400 mt-2">Manage and view all your courses</p>
                        </div>
                        <button
                            onClick={handleAdd}
                            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add New Course
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
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Courses Table */}
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
                                                Course Name
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Instructor
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Duration
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Students
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
                                        {filteredCourses.map((course) => (
                                            <tr key={course.id} className="hover:bg-gray-800/30 transition-colors duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-white font-bold">
                                                            {course.name.charAt(0)}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-white">
                                                                {course.name}
                                                            </div>
                                                            <div className="text-sm text-gray-400">
                                                                {course.description ? course.description.substring(0, 50) + (course.description.length > 50 ? '...' : '') : 'No description'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {course.instructor || 'Not assigned'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {course.duration || 'Not specified'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {parseFloat(course.price).toFixed(2)} MAD
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {course.students_count || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(course.is_active)}`}>
                                                        {course.is_active ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(course)}
                                                            className="text-yellow-500 hover:text-yellow-400 transition-colors duration-200"
                                                            title="Edit"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleActive(course.id)}
                                                            className={`${course.is_active ? "text-red-500 hover:text-red-400" : "text-green-500 hover:text-green-400"} transition-colors duration-200`}
                                                            title={course.is_active ? "Deactivate" : "Activate"}
                                                        >
                                                            {course.is_active ? (
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m-12.728 12.728L5.636 5.636" />
                                                                </svg>
                                                            ) : (
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(course.id)}
                                                            className="text-red-500 hover:text-red-400 transition-colors duration-200"
                                                            title="Delete"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m0 0v6m0-6h6m-6 0H6" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredCourses.length === 0 && (
                                <div className="text-center py-12">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-400">No courses found</h3>
                                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search or create a new course.</p>
                                    <div className="mt-6">
                                        <button
                                            onClick={handleAdd}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Add New Course
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Modal for Add Course */}
            {isAdding && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
                    <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 border border-gray-700">
                        <h3 className="text-2xl font-bold text-white mb-6">
                            Add New Course
                        </h3>
                        <form onSubmit={handleCreate}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 mb-2">Course Name</label>
                                    <input
                                        type="text"
                                        value={newCourse.name}
                                        onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Description</label>
                                    <textarea
                                        value={newCourse.description}
                                        onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        rows="3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={newCourse.price}
                                        onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Duration</label>
                                    <input
                                        type="text"
                                        value={newCourse.duration}
                                        onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        placeholder="e.g., 8 weeks, 3 months"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Instructor</label>
                                    <input
                                        type="text"
                                        value={newCourse.instructor}
                                        onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={newCourse.is_active}
                                        onChange={(e) => setNewCourse({ ...newCourse, is_active: e.target.checked })}
                                        className="h-4 w-4 text-yellow-500 rounded focus:ring-yellow-500"
                                    />
                                    <label htmlFor="is_active" className="ml-2 text-gray-400">
                                        Active
                                    </label>
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
                                    {loading ? "Processing..." : "Add Course"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Edit Course */}
            {isEditing && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
                    <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 border border-gray-700">
                        <h3 className="text-2xl font-bold text-white mb-6">
                            Edit Course
                        </h3>
                        <form onSubmit={handleUpdate}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 mb-2">Course Name</label>
                                    <input
                                        type="text"
                                        value={newCourse.name}
                                        onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Description</label>
                                    <textarea
                                        value={newCourse.description}
                                        onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        rows="3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={newCourse.price}
                                        onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Duration</label>
                                    <input
                                        type="text"
                                        value={newCourse.duration}
                                        onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        placeholder="e.g., 8 weeks, 3 months"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Instructor</label>
                                    <input
                                        type="text"
                                        value={newCourse.instructor}
                                        onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={newCourse.is_active}
                                        onChange={(e) => setNewCourse({ ...newCourse, is_active: e.target.checked })}
                                        className="h-4 w-4 text-yellow-500 rounded focus:ring-yellow-500"
                                    />
                                    <label htmlFor="is_active" className="ml-2 text-gray-400">
                                        Active
                                    </label>
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
                                    {loading ? "Processing..." : "Update Course"}
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
