// resources/js/Pages/Admin/Attendance.jsx
import React, { useState, useEffect } from "react";
import { router, Head } from "@inertiajs/react";
import toast from "react-hot-toast";
import AdminSidebar from "@/Components/AdminSidebar";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Register all necessary Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Attendance = ({ course = null, sessions = [], students = [], stats = {} }) => {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        session_date: '',
        topic: ''
    });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [chartData, setChartData] = useState({
        monthlyAttendance: new Array(12).fill(0),
        attendanceDistribution: { present: 0, absent: 0, late: 0 }
    });

    // Load chart data
    useEffect(() => {
        if (course) {
            setChartData({
                monthlyAttendance: stats.monthlyAttendance || new Array(12).fill(0),
                attendanceDistribution: {
                    present: stats.totalPresent || 0,
                    absent: stats.totalAbsent || 0,
                    late: stats.totalLate || 0
                }
            });
        }
    }, [course, stats]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // Submit new session
    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        router.post(`/courses/${course.id}/attendance/session`, form, {
            onSuccess: () => {
                setForm({ session_date: '', topic: '' });
                setShowCreateModal(false);
                toast.success("Session created successfully");
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

    // Update attendance status
    const updateAttendance = (sessionId, attendanceId, status) => {
        router.patch(
            `/sessions/${sessionId}/attendance/${attendanceId}`,
            { status },
            {
                onSuccess: () => {
                    toast.success("Attendance updated successfully");
                },
                onError: (errors) => {
                    Object.values(errors).forEach(error => {
                        toast.error(error);
                    });
                }
            }
        );
    };

    // Attendance distribution (Pie chart)
    const attendanceDistributionData = {
        labels: ["Present", "Absent", "Late"],
        datasets: [
            {
                data: [
                    chartData.attendanceDistribution.present || 0,
                    chartData.attendanceDistribution.absent || 0,
                    chartData.attendanceDistribution.late || 0
                ],
                backgroundColor: [
                    "rgba(74, 222, 128, 0.8)", // Green for Present
                    "rgba(239, 68, 68, 0.8)",   // Red for Absent
                    "rgba(253, 224, 71, 0.8)"   // Yellow for Late
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

    // Monthly attendance (Bar chart)
    const monthlyAttendanceData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
            {
                label: "Monthly Sessions",
                data: chartData.monthlyAttendance,
                backgroundColor: "rgba(253, 224, 71, 0.6)",
                borderColor: "rgba(253, 224, 71, 1)",
                borderWidth: 1,
            },
        ],
    };

    if (!course) {
        return (
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
                
                <AdminSidebar activeItem="Attendance" isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <div className="text-center py-12">
                        <p className="text-gray-400">Please select a course to view attendance.</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <>
            <Head title={`Attendance - ${course.name}`} />
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
                
                <AdminSidebar activeItem="Attendance" isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {/* Top bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 mb-6 lg:mb-8">
                        <div className="mt-12 lg:mt-0">
                            <h1 className="text-2xl lg:text-4xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                                Attendance Management
                            </h1>
                            <p className="text-gray-400 text-sm lg:text-base">Track attendance for {course.name}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="w-full sm:w-auto px-4 lg:px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium rounded-lg hover:opacity-90 transition-opacity"
                            >
                                Add Session
                            </button>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
                        <div className="bg-gray-800/50 backdrop-blur-sm p-4 lg:p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm text-gray-400">Total Sessions</h3>
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-2xl lg:text-3xl font-bold text-blue-500">{stats.totalSessions || 0}</div>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm p-4 lg:p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm text-gray-400">Present</h3>
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-2xl lg:text-3xl font-bold text-green-500">{stats.totalPresent || 0}</div>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm p-4 lg:p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm text-gray-400">Absent</h3>
                                <div className="p-2 bg-red-500/20 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-2xl lg:text-3xl font-bold text-red-500">{stats.totalAbsent || 0}</div>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm p-4 lg:p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm text-gray-400">Late</h3>
                                <div className="p-2 bg-yellow-500/20 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-2xl lg:text-3xl font-bold text-yellow-500">{stats.totalLate || 0}</div>
                        </div>
                    </div>

                    {/* Attendance charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 lg:mb-8">
                        {/* Monthly attendance chart */}
                        <div className="bg-gray-800/50 backdrop-blur-sm p-4 lg:p-6 rounded-xl shadow-md">
                            <h3 className="text-base lg:text-lg font-semibold text-yellow-500 mb-4">Monthly Sessions</h3>
                            <div style={{ height: '250px' }} className="relative">
                                <Bar
                                    data={monthlyAttendanceData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                display: false
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
                                                    stepSize: 1,
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

                        {/* Attendance distribution chart */}
                        <div className="bg-gray-800/50 backdrop-blur-sm p-4 lg:p-6 rounded-xl shadow-md">
                            <h3 className="text-base lg:text-lg font-semibold text-yellow-500 mb-4">Attendance Distribution</h3>
                            <div style={{ height: '250px' }} className="relative">
                                <Pie
                                    data={attendanceDistributionData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'right',
                                                labels: {
                                                    color: '#D1D5DB',
                                                    padding: 15,
                                                    font: {
                                                        size: 12
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sessions Table */}
                    <div className="bg-gray-800/50 backdrop-blur-sm p-4 lg:p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                        <h2 className="text-lg lg:text-xl font-semibold text-yellow-500 mb-5">All Sessions</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-600 text-gray-400">
                                        <th className="py-3 px-2 lg:px-4 text-xs lg:text-sm">Date</th>
                                        <th className="py-3 px-2 lg:px-4 text-xs lg:text-sm">Topic</th>
                                        <th className="py-3 px-2 lg:px-4 text-xs lg:text-sm">Present</th>
                                        <th className="py-3 px-2 lg:px-4 text-xs lg:text-sm hidden sm:table-cell">Absent</th>
                                        <th className="py-3 px-2 lg:px-4 text-xs lg:text-sm hidden md:table-cell">Late</th>
                                        <th className="py-3 px-2 lg:px-4 text-xs lg:text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessions.map(session => (
                                        <React.Fragment key={session.id}>
                                            <tr className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                                                <td className="py-3 px-2 lg:px-4">
                                                    <div className="text-xs lg:text-sm text-gray-300">
                                                        {new Date(session.session_date).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2 lg:px-4">
                                                    <div className="text-xs lg:text-sm text-gray-300">
                                                        {session.topic || 'No topic'}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2 lg:px-4">
                                                    <div className="text-xs lg:text-sm font-medium text-green-500">
                                                        {session.attendances?.filter(a => a.status === 'present').length || 0}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2 lg:px-4 text-xs lg:text-sm font-medium text-red-500 hidden sm:table-cell">
                                                    {session.attendances?.filter(a => a.status === 'absent').length || 0}
                                                </td>
                                                <td className="py-3 px-2 lg:px-4 text-xs lg:text-sm font-medium text-yellow-500 hidden md:table-cell">
                                                    {session.attendances?.filter(a => a.status === 'late').length || 0}
                                                </td>
                                                <td className="py-3 px-2 lg:px-4">
                                                    <button
                                                        onClick={() => {
                                                            const detailsRow = document.getElementById(`details-${session.id}`);
                                                            detailsRow.classList.toggle('hidden');
                                                        }}
                                                        className="text-blue-400 hover:text-blue-300 text-xs lg:text-sm font-medium"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr
                                                id={`details-${session.id}`}
                                                className="hidden border-b border-gray-800 bg-gray-800/50"
                                            >
                                                <td colSpan="6" className="p-4">
                                                    <div className="grid grid-cols-1 gap-4">
                                                        {session.attendances?.map(attendance => (
                                                            <div
                                                                key={attendance.id}
                                                                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-700/50 rounded-lg space-y-2 sm:space-y-0"
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-white font-bold text-xs">
                                                                        {attendance.student?.first_name?.charAt(0)}{attendance.student?.last_name?.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm font-medium text-gray-300">
                                                                            {attendance.student?.first_name} {attendance.student?.last_name}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
                                                                            {attendance.student?.email}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <select
                                                                    value={attendance.status}
                                                                    onChange={(e) => updateAttendance(session.id, attendance.id, e.target.value)}
                                                                    className={`px-3 py-1 rounded-full text-xs font-medium w-full sm:w-auto ${attendance.status === 'present'
                                                                            ? 'bg-green-600/20 text-green-400'
                                                                            : attendance.status === 'absent'
                                                                                ? 'bg-red-600/20 text-red-400'
                                                                                : 'bg-yellow-600/20 text-yellow-400'
                                                                        }`}
                                                                    style={{
                                                                        backgroundColor: attendance.status === 'present'
                                                                            ? 'rgba(34, 197, 94, 0.2)'
                                                                            : attendance.status === 'absent'
                                                                                ? 'rgba(239, 68, 68, 0.2)'
                                                                                : 'rgba(253, 224, 71, 0.2)',
                                                                        color: attendance.status === 'present'
                                                                            ? '#86efac'
                                                                            : attendance.status === 'absent'
                                                                                ? '#fca5a5'
                                                                                : '#fde68a',
                                                                        border: 'none',
                                                                        outline: 'none',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    <option value="present">Present</option>
                                                                    <option value="absent">Absent</option>
                                                                    <option value="late">Late</option>
                                                                </select>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    ))}
                                    {sessions.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="py-4 text-center text-gray-400">
                                                No sessions found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {/* Create Session Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-yellow-500">Create New Session</h3>
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
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Session Date</label>
                                    <input
                                        type="date"
                                        name="session_date"
                                        value={form.session_date}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Topic (Optional)</label>
                                    <input
                                        type="text"
                                        name="topic"
                                        value={form.topic}
                                        onChange={handleChange}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        placeholder="Enter session topic"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        {loading ? 'Creating...' : 'Create Session'}
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

export default Attendance;
