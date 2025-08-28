import React, { useState, useEffect } from "react";
import { router, Head } from "@inertiajs/react";
import toast from "react-hot-toast";
import AdminSidebar from "@/Components/AdminSidebar";
import { Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Register all necessary Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const AdminDashboard = ({ certificates: initialCertificates = [], students = [], courses = [], stats: initialStats = {} }) => {
    const [certificates, setCertificates] = useState(initialCertificates);
    const [filteredCertificates, setFilteredCertificates] = useState(initialCertificates);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [stats, setStats] = useState(initialStats);
    const [studentTrends, setStudentTrends] = useState(new Array(12).fill(0));
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Search handler
    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);

        const filtered = certificates.filter((certificate) => {
            return (
                certificate.student_name.toLowerCase().includes(value) ||
                certificate.certificate_number.toLowerCase().includes(value) ||
                certificate.course_name.toLowerCase().includes(value)
            );
        });
        setFilteredCertificates(filtered);
        toast.success("Search completed successfully");
    };

    // Data processing
    useEffect(() => {
        const monthlyData = new Array(12).fill(0);
        students.forEach(student => {
            if (student.created_at) {
                const month = new Date(student.created_at).getMonth();
                monthlyData[month]++;
            }
        });
        setStudentTrends(monthlyData);
    }, [students]);

    // Actions
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this certificate?")) return;
        setLoading(true);
        try {
            await router.delete(`/admin/certificate/${id}`);
            setCertificates(certificates.filter((cert) => cert.id !== id));
            setFilteredCertificates(filteredCertificates.filter((cert) => cert.id !== id));
            toast.success("Certificate deleted successfully");
        } catch (error) {
            toast.error("Error deleting certificate");
        } finally {
            setLoading(false);
        }
    };

    const handleBlock = async (id) => {
        setLoading(true);
        try {
            await router.post(`/admin/certificate/block/${id}`);
            setCertificates(certificates.map((cert) =>
                cert.id === id ? { ...cert, blocked: true } : cert
            ));
            setFilteredCertificates(filteredCertificates.map((cert) =>
                cert.id === id ? { ...cert, blocked: true } : cert
            ));
            toast.success("Certificate blocked successfully");
        } catch (error) {
            toast.error("Error blocking certificate");
        } finally {
            setLoading(false);
        }
    };

    const handleUnblock = async (id) => {
        setLoading(true);
        try {
            await router.post(`/admin/certificate/unblock/${id}`);
            setCertificates(certificates.map((cert) =>
                cert.id === id ? { ...cert, blocked: false } : cert
            ));
            setFilteredCertificates(filteredCertificates.map((cert) =>
                cert.id === id ? { ...cert, blocked: false } : cert
            ));
            toast.success("Certificate unblocked successfully");
        } catch (error) {
            toast.error("Error unblocking certificate");
        } finally {
            setLoading(false);
        }
    };

    // Trends chart
    const trendsData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
            {
                label: "Students Registered",
                data: studentTrends,
                borderColor: "#FFE662",
                backgroundColor: "rgba(253, 224, 71, 0.2)",
                tension: 0.4,
                fill: true,
            },
        ],
    };

    // Student status distribution
    const studentStatusData = {
        labels: ["Active", "Banned", "Pending Payment"],
        datasets: [
            {
                data: [
                    students.filter(s => s.status === 'active').length,
                    students.filter(s => s.status === 'banned').length,
                    students.filter(s => s.payment_status === 'pending').length
                ],
                backgroundColor: [
                    "rgba(74, 222, 128, 0.8)",
                    "rgba(239, 68, 68, 0.8)",
                    "rgba(253, 224, 71, 0.8)"
                ],
                borderColor: [
                    "rgba(74, 222, 128, 1)",
                    "rgba(239, 68, 68, 1)",
                    "rgba(253, 224, 71, 1)"
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
                {/* Mobile menu button */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-gray-800 text-yellow-500"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Sidebar */}
                <AdminSidebar activeItem="Dashboard" isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                {/* Main content area */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {/* Top bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 mb-6 lg:mb-8">
                        <div className="mt-12 lg:mt-0">
                            <h1 className="text-2xl lg:text-4xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                                Dashboard
                            </h1>
                            <p className="text-gray-400 text-sm lg:text-base">Overview of your students and courses</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
                            {/* Search input */}
                            <div className="relative flex items-center w-full sm:w-auto">
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
                                    onChange={handleSearch}
                                    placeholder="Search certificates..."
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                            </div>
                            {/* Date display */}
                            <div className="flex items-center space-x-2 text-gray-400">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5 text-yellow-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm">{new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
                        <div className="bg-gray-800/50 backdrop-blur-sm p-4 lg:p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm text-gray-400">Total Students</h3>
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 011.933-0.067 4.501 20.118a17.933 17.933 0 01-8.618-3.04A17.933 17.933 0 01-8.618 3.04z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-2xl lg:text-3xl font-bold text-green-500">{stats.totalStudents ?? '-'}</div>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm p-4 lg:p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm text-gray-400">Active Students</h3>
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-2xl lg:text-3xl font-bold text-blue-500">{students.filter(s => s.status === 'active').length}</div>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm p-4 lg:p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm text-gray-400">Pending Payments</h3>
                                <div className="p-2 bg-yellow-500/20 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-2xl lg:text-3xl font-bold text-yellow-500">{students.filter(s => s.payment_status === 'pending').length}</div>
                        </div>
                    </div>

                    {/* Student charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 lg:mb-8">
                        {/* Trends chart */}
                        <div className="bg-gray-800/50 backdrop-blur-sm p-4 lg:p-6 rounded-xl shadow-md">
                            <h3 className="text-base lg:text-lg font-semibold text-yellow-500 mb-4">Student Registration Trends</h3>
                            <div style={{ height: '250px' }} className="relative">
                                <Line
                                    data={trendsData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                labels: {
                                                    color: '#D1D5DB',
                                                    font: {
                                                        size: 12
                                                    }
                                                }
                                            },
                                        },
                                        scales: {
                                            x: {
                                                grid: {
                                                    color: 'rgba(209, 213, 219, 0.1)'
                                                },
                                                ticks: {
                                                    color: '#D1D5DB',
                                                    font: {
                                                        size: 11
                                                    }
                                                }
                                            },
                                            y: {
                                                grid: {
                                                    color: 'rgba(209, 213, 219, 0.1)'
                                                },
                                                ticks: {
                                                    color: '#D1D5DB',
                                                    font: {
                                                        size: 11
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Student status chart */}
                        <div className="bg-gray-800/50 backdrop-blur-sm p-4 lg:p-6 rounded-xl shadow-md">
                            <h3 className="text-base lg:text-lg font-semibold text-yellow-500 mb-4">Student Status Distribution</h3>
                            <div style={{ height: '250px' }} className="relative">
                                <Pie
                                    data={studentStatusData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'right',
                                                labels: {
                                                    color: '#D1D5DB',
                                                    font: {
                                                        size: 12
                                                    },
                                                    padding: 10
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Certificate table and extra panel */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Certificates Table */}
                        <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm p-4 lg:p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                            <h2 className="text-lg lg:text-xl font-semibold text-yellow-500 mb-5">
                                Recent Certificates
                            </h2>
                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-600 text-gray-400">
                                                <th className="py-3 px-2 lg:px-4 text-xs lg:text-sm">Certificate ID</th>
                                                <th className="py-3 px-2 lg:px-4 text-xs lg:text-sm">Student Name</th>
                                                <th className="py-3 px-2 lg:px-4 text-xs lg:text-sm hidden sm:table-cell">Course</th>
                                                <th className="py-3 px-2 lg:px-4 text-xs lg:text-sm hidden md:table-cell">Issued</th>
                                                <th className="py-3 px-2 lg:px-4 text-xs lg:text-sm">Status</th>
                                                <th className="py-3 px-2 lg:px-4 text-xs lg:text-sm">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredCertificates.slice(0, 6).map((certificate) => (
                                                <tr
                                                    key={certificate.id}
                                                    className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                                                >
                                                    <td className="py-3 px-2 lg:px-4">
                                                        <span className="text-xs lg:text-sm text-gray-300">
                                                            {certificate.certificate_number}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-2 lg:px-4">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-white font-bold text-xs">
                                                                {certificate.student_name?.charAt(0)}
                                                            </div>
                                                            <span className="ml-2 text-xs lg:text-sm text-gray-300">
                                                                {certificate.student_name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-2 lg:px-4 text-xs lg:text-sm text-gray-300 hidden sm:table-cell">
                                                        {certificate.course_name}
                                                    </td>
                                                    <td className="py-3 px-2 lg:px-4 text-xs lg:text-sm text-gray-300 hidden md:table-cell">
                                                        {certificate.issued_date}
                                                    </td>
                                                    <td className="py-3 px-2 lg:px-4">
                                                        <span
                                                            className={`text-xs font-semibold px-2 lg:px-3 py-1 rounded-full ${certificate.blocked
                                                                ? "bg-red-600/20 text-red-400"
                                                                : "bg-green-600/20 text-green-400"
                                                                }`}
                                                        >
                                                            {certificate.blocked ? "Blocked" : "Active"}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-2 lg:px-4 flex items-center space-x-2">
                                                        <button
                                                            onClick={() =>
                                                                certificate.blocked
                                                                    ? handleUnblock(certificate.id)
                                                                    : handleBlock(certificate.id)
                                                            }
                                                            className={`w-8 h-8 flex items-center justify-center rounded-lg ${certificate.blocked
                                                                ? "bg-green-600 text-white hover:bg-green-700"
                                                                : "bg-yellow-600 text-black hover:bg-yellow-700"
                                                                }`}
                                                            title={certificate.blocked ? "Unblock" : "Block"}
                                                        >
                                                            {certificate.blocked ? (
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 24 24"
                                                                    className="w-4 h-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                >
                                                                    <path d="M9 11V7a3 3 0 016 0v4" />
                                                                    <rect x="5" y="11" width="14" height="10" rx="2" />
                                                                </svg>
                                                            ) : (
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 24 24"
                                                                    className="w-4 h-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                >
                                                                    <rect x="3" y="11" width="18" height="11" rx="2" />
                                                                    <path d="M7 11V7a5 5 0 0110 0v4" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredCertificates.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" className="py-4 text-center text-gray-400">
                                                        No certificates found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Additional widget */}
                        <div className="bg-gray-800/50 backdrop-blur-sm p-4 lg:p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                            <h3 className="text-base lg:text-lg font-semibold text-yellow-500 mb-4">
                                Student Breakdown
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-1 text-xs lg:text-sm">
                                        <span className="text-gray-300">Active Students</span>
                                        <span className="text-gray-300">
                                            {students.filter(s => s.status === 'active').length} ({students.length ? Math.round((students.filter(s => s.status === 'active').length / students.length) * 100) : 0}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-600 h-2 rounded-full">
                                        <div
                                            className="h-full bg-green-500 rounded-full"
                                            style={{
                                                width: `${students.length ? (students.filter(s => s.status === 'active').length / students.length) * 100 : 0}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1 text-xs lg:text-sm">
                                        <span className="text-gray-300">Banned Students</span>
                                        <span className="text-gray-300">
                                            {students.filter(s => s.status === 'banned').length} ({students.length ? Math.round((students.filter(s => s.status === 'banned').length / students.length) * 100) : 0}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-600 h-2 rounded-full">
                                        <div
                                            className="h-full bg-red-500 rounded-full"
                                            style={{
                                                width: `${students.length ? (students.filter(s => s.status === 'banned').length / students.length) * 100 : 0}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1 text-xs lg:text-sm">
                                        <span className="text-gray-300">Students Pending Payment</span>
                                        <span className="text-gray-300">
                                            {students.filter(s => s.payment_status === 'pending').length} ({students.length ? Math.round((students.filter(s => s.payment_status === 'pending').length / students.length) * 100) : 0}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-600 h-2 rounded-full">
                                        <div
                                            className="h-full bg-yellow-500 rounded-full"
                                            style={{
                                                width: `${students.length ? (students.filter(s => s.payment_status === 'pending').length / students.length) * 100 : 0}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default AdminDashboard;
