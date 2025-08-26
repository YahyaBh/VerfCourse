// resources/js/Pages/Admin/Courses.jsx
import React, { useState } from "react";
import { router, Head, Link } from "@inertiajs/react";
import toast from "react-hot-toast";
import AdminSidebar from "@/Components/AdminSidebar";

const Courses = ({ courses = [] }) => {
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredCourses, setFilteredCourses] = useState(courses);
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        duration: '',
        instructor: '',
        is_active: true
    });
    const [editingCourse, setEditingCourse] = useState(null);

    // Handle search
    React.useEffect(() => {
        if (searchTerm === '') {
            setFilteredCourses(courses);
        } else {
            const filtered = courses.filter((course) => {
                return (
                    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    course.instructor?.toLowerCase().includes(searchTerm.toLowerCase())
                );
            });
            setFilteredCourses(filtered);
        }
    }, [searchTerm, courses]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle edit form input changes
    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditingCourse(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Submit new course
    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        router.post('/course/create', form, {
            onSuccess: (page) => {
                setFilteredCourses(page.props.courses);
                setForm({
                    name: '',
                    description: '',
                    price: '',
                    duration: '',
                    instructor: '',
                    is_active: true
                });
                setShowCreateModal(false);
                toast.success("Course created successfully");
            },
            onError: (errors) => {
                Object.values(errors).forEach(error => {
                    toast.error(error);
                });
            },
            onFinish: () => {
                setLoading(false);
            }
        });
    };

    // Update course
    const handleUpdate = (e) => {
        e.preventDefault();
        setLoading(true);

        router.put(`/courses/${editingCourse.id}`, editingCourse, {
            onSuccess: (page) => {
                setFilteredCourses(page.props.courses);
                setShowEditModal(false);
                setEditingCourse(null);
                toast.success("Course updated successfully");
            },
            onError: (errors) => {
                Object.values(errors).forEach(error => {
                    toast.error(error);
                });
            },
            onFinish: () => {
                setLoading(false);
            }
        });
    };

    // Delete course
    const handleDelete = (id) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;

        router.delete(`/courses/${id}`, {
            onSuccess: (page) => {
                setFilteredCourses(page.props.courses);
                toast.success("Course deleted successfully");
            },
            onError: (errors) => {
                Object.values(errors).forEach(error => {
                    toast.error(error);
                });
            }
        });
    };

    // Toggle course active status
    const toggleActive = (id) => {
        router.put(`/courses/${id}/toggle-active`, {}, {
            onSuccess: (page) => {
                setFilteredCourses(page.props.courses);
                toast.success("Course status updated successfully");
            },
            onError: (errors) => {
                Object.values(errors).forEach(error => {
                    toast.error(error);
                });
            }
        });
    };

    // Open edit modal
    const openEditModal = (course) => {
        setEditingCourse({ ...course });
        setShowEditModal(true);
    };

    return (
        <>
            <Head title="Courses" />
            <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
                {/* Sidebar */}
                <AdminSidebar activeItem="Courses" />

                {/* Main content area */}
                <main className="flex-1 overflow-y-auto p-6">
                    {/* Top bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 mb-8">
                        <div>
                            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                                Courses
                            </h1>
                            <p className="text-gray-400">Manage your courses and curriculum</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            {/* Search input */}
                            <div className="relative flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="absolute left-3 w-5 h-5 text-gray-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 19a8 8 0 100-16 8 8 0 000 16z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                                </svg>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search courses..."
                                    className="pl-10 pr-4 py-3 rounded-lg bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                            </div>
                            {/* Add course button */}
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium rounded-lg hover:opacity-90 transition-opacity"
                            >
                                Add Course
                            </button>
                        </div>
                    </div>

                    {/* Stats summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm text-gray-400">Total Courses</h3>
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-green-500">{courses.length}</div>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm text-gray-400">Active Courses</h3>
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-blue-500">{courses.filter(c => c.is_active).length}</div>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm text-gray-400">Total Enrollments</h3>
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-purple-500">
                                {courses.reduce((sum, course) => sum + (course.students_count || 0), 0)}
                            </div>
                        </div>
                    </div>

                    {/* Courses Table */}
                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                        <h2 className="text-xl font-semibold text-yellow-500 mb-5">All Courses</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-600 text-gray-400">
                                        <th className="py-3 px-4">Course</th>
                                        <th className="py-3 px-4">Instructor</th>
                                        <th className="py-3 px-4">Price</th>
                                        <th className="py-3 px-4">Duration</th>
                                        <th className="py-3 px-4">Students</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCourses.map(course => (
                                        <tr
                                            key={course.id}
                                            className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                                        >
                                            <td className="py-3 px-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-white font-bold text-xs">
                                                        {course.name.charAt(0)}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-300">{course.name}</div>
                                                        <div className="text-xs text-gray-500 max-w-xs truncate">
                                                            {course.description || 'No description'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-sm text-gray-300">{course.instructor || 'N/A'}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-sm font-medium text-gray-300">${course.price}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-sm text-gray-300">{course.duration || 'N/A'}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-sm text-gray-300">{course.students_count || 0}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${course.is_active ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                                                    }`}>
                                                    {course.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center space-x-2">
                                                    {/* Toggle status */}
                                                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                                        <input
                                                            type="checkbox"
                                                            id={`status-toggle-${course.id}`}
                                                            className="sr-only"
                                                            checked={course.is_active}
                                                            onChange={() => toggleActive(course.id)}
                                                        />
                                                        <div className={`block w-10 h-6 rounded-full ${course.is_active ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${course.is_active ? 'transform translate-x-4' : ''}`}></div>
                                                    </div>

                                                    {/* Edit button */}
                                                    <button
                                                        onClick={() => openEditModal(course)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                                                        title="Edit"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>

                                                    {/* Delete button */}
                                                    <button
                                                        onClick={() => handleDelete(course.id)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700"
                                                        title="Delete"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>

                                                    {/* View button */}
                                                    <Link
                                                        href={`/courses/${course.id}`}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-600 text-white hover:bg-gray-700"
                                                        title="View"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </Link>
                                                </div>
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
                        </div>
                    </div>
                </main>
            </div>

            {/* Create Course Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-yellow-500">Add New Course</h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Course Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        placeholder="Course name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        placeholder="Course description"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Price</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-400 sm:text-sm">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="price"
                                            value={form.price}
                                            onChange={handleChange}
                                            required
                                            className="block w-full pl-7 pr-12 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Duration</label>
                                    <input
                                        type="text"
                                        name="duration"
                                        value={form.duration}
                                        onChange={handleChange}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        placeholder="e.g. 8 weeks"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Instructor</label>
                                    <input
                                        type="text"
                                        name="instructor"
                                        value={form.instructor}
                                        onChange={handleChange}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        placeholder="Instructor name"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        name="is_active"
                                        checked={form.is_active}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-600 rounded bg-gray-700"
                                    />
                                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-300">
                                        Active
                                    </label>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        {loading ? 'Creating...' : 'Create Course'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Course Modal */}
            {showEditModal && editingCourse && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-yellow-500">Edit Course</h3>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Course Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editingCourse.name}
                                        onChange={handleEditChange}
                                        required
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={editingCourse.description || ''}
                                        onChange={handleEditChange}
                                        rows="3"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Price</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-400 sm:text-sm">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="price"
                                            value={editingCourse.price}
                                            onChange={handleEditChange}
                                            required
                                            className="block w-full pl-7 pr-12 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Duration</label>
                                    <input
                                        type="text"
                                        name="duration"
                                        value={editingCourse.duration || ''}
                                        onChange={handleEditChange}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Instructor</label>
                                    <input
                                        type="text"
                                        name="instructor"
                                        value={editingCourse.instructor || ''}
                                        onChange={handleEditChange}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        name="is_active"
                                        checked={editingCourse.is_active}
                                        onChange={handleEditChange}
                                        className="h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-600 rounded bg-gray-700"
                                    />
                                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-300">
                                        Active
                                    </label>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        {loading ? 'Updating...' : 'Update Course'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Courses;
