import React, { useState, useEffect } from "react";
import { Link, usePage, router } from "@inertiajs/react";

const AdminSidebar = ({ activeItem, isOpen, onClose }) => {
    const { auth } = usePage().props;
    const [courses, setCourses] = useState([]);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeItem === "Attendance") {
            fetchCourses();
        }
    }, [activeItem]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/courses');
            const data = await response.json();
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCourseSelect = (courseId) => {
        setShowCourseModal(false);
        if (onClose) onClose(); // Close sidebar on mobile after selection
        router.visit(`/courses/${courseId}/attendance`);
    };

    const navItems = [
        {
            label: "Dashboard",
            href: "/admin/dashboard",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h1v11h1m-2 0V10h-1m0 0a2 2 0 012-2h14a2 2 0 012 2v0m-16 0h-1m16 0h1m-1 0V10" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 3v1m0 0H3v1m18-1v1m-18 0H3" />
                </svg>
            )
        },
        {
            label: "Certificates",
            href: "/admin/certificates",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <path d="M8 9h8" />
                    <path d="M8 13h5" />
                </svg>
            )
        },
        {
            label: "Students",
            href: "/admin/students",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
            )
        },
        {
            label: "Courses",
            href: "/admin/courses",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            )
        },
        {
            label: "Attendance",
            href: "/admin/attendance",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            isModal: true
        },
        {
            label: "Payments",
            href: "/admin/payments",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="6" width="20" height="14" rx="2" stroke="#eab308" strokeWidth="1.5" />
                    <rect x="2" y="10" width="20" height="3" fill="#eab308" />
                    <rect x="4" y="14" width="3" height="4" rx="0.5" fill="#eab308" />
                    <path d="M17 13.5C17 14.3284 16.3284 15 15.5 15C14.6716 15 14 14.3284 14 13.5C14 12.6716 14.6716 12 15.5 12C16.3284 12 17 12.6716 17 13.5Z" stroke="#eab308" strokeWidth="1.5" />
                    <path d="M15.5 11V16" stroke="#eab308" strokeWidth="1.5" />
                    <path d="M14 13.5H17" stroke="#eab308" strokeWidth="1.5" />
                </svg>
            )
        }
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex bg-gradient-to-b from-gray-800 to-black text-white w-60 min-h-screen flex flex-col justify-between py-6 fixed top-0 left-0 bottom-0 z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="px-6">
                    {/* Logo / Brand */}
                    <div className="flex items-center mb-8">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-white font-bold text-xl">
                            W
                        </div>
                        <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                            WEBINA
                        </span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.isModal ? "#" : item.href}
                                onClick={(e) => {
                                    if (item.isModal) {
                                        e.preventDefault();
                                        setShowCourseModal(true);
                                        if (courses.length === 0) {
                                            fetchCourses();
                                        }
                                    }
                                }}
                                className={`flex items-center justify-between px-4 py-3 rounded-lg ${activeItem === item.label
                                    ? "bg-gray-800/50 text-white"
                                    : "text-gray-400 hover:bg-gray-800/30 hover:text-white"
                                    } transition-colors`}
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="text-yellow-500">{item.icon}</span>
                                    <span className="font-medium">{item.label}</span>
                                </div>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* User profile section */}
                <div className="px-6 mt-auto">
                    <div className="flex items-center space-x-3 p-4 bg-gray-800/30 rounded-xl">
                        {/* User avatar with gradient background */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-white font-bold">
                            {auth.user.name ? auth.user.name.charAt(0) : 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                            {/* User name and email */}
                            <div className="text-sm font-bold text-white">{auth.user.name}</div>
                            <div className="text-xs text-gray-400 truncate">{auth.user.email}</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            <aside className={`lg:hidden bg-gradient-to-b from-gray-800 to-black text-white w-64 min-h-screen flex flex-col justify-between py-6 fixed top-0 left-0 bottom-0 z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="px-6">
                    {/* Logo / Brand */}
                    <div className="flex items-center mb-8">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-white font-bold text-xl">
                            W
                        </div>
                        <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                            WEBINA
                        </span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.isModal ? "#" : item.href}
                                onClick={(e) => {
                                    if (item.isModal) {
                                        e.preventDefault();
                                        setShowCourseModal(true);
                                        if (courses.length === 0) {
                                            fetchCourses();
                                        }
                                    } else {
                                        // Close sidebar when navigating to a new page on mobile
                                        if (onClose) onClose();
                                    }
                                }}
                                className={`flex items-center justify-between px-4 py-3 rounded-lg ${activeItem === item.label
                                    ? "bg-gray-800/50 text-white"
                                    : "text-gray-400 hover:bg-gray-800/30 hover:text-white"
                                    } transition-colors`}
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="text-yellow-500">{item.icon}</span>
                                    <span className="font-medium">{item.label}</span>
                                </div>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* User profile section */}
                <div className="px-6 mt-auto">
                    <div className="flex items-center space-x-3 p-4 bg-gray-800/30 rounded-xl">
                        {/* User avatar with gradient background */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-white font-bold">
                            {auth.user.name ? auth.user.name.charAt(0) : 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                            {/* User name and email */}
                            <div className="text-sm font-bold text-white">{auth.user.name}</div>
                            <div className="text-xs text-gray-400 truncate">{auth.user.email}</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile sidebar */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={onClose}
                ></div>
            )}

            {/* Course Selection Modal */}
            {showCourseModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl lg:text-2xl font-bold text-white">Select a Course</h2>
                            <button
                                onClick={() => setShowCourseModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                            </div>
                        ) : courses.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {courses.map((course) => (
                                    <div
                                        key={course.id}
                                        onClick={() => handleCourseSelect(course.id)}
                                        className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 cursor-pointer transition-colors"
                                    >
                                        <h3 className="text-lg font-semibold text-white mb-2">{course.name}</h3>
                                        <p className="text-gray-400 text-sm">{course.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-400">No courses found</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminSidebar;
