// resources/js/Pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { router, Head, Link } from "@inertiajs/react";
import toast from "react-hot-toast";
import AdminSidebar from "@/Components/AdminSidebar";
import { Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Register all necessary Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement, // Register PointElement (required for line charts)
    LineElement,  // Register LineElement
    Title,
    Tooltip,
    Legend,
    ArcElement
);
const AdminDashboard = () => {
    const [certificates, setCertificates] = useState([]);
    const [filteredCertificates, setFilteredCertificates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [stats, setStats] = useState({ total: 0, blocked: 0, today: 0 });
    const [certificateTrends, setCertificateTrends] = useState([]);


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


    // Data fetching
    useEffect(() => {
        const fetchCertificates = async () => {
            setLoading(true);
            try {
                const response = await fetch("/certificates");
                const data = await response.json();
                if (response.ok) {
                    setCertificates(data);
                    setFilteredCertificates(data);

                    // Create the data for trends chart
                    const trends = data.map(cert => {
                        const month = new Date(cert.issued_date).getMonth() + 1;
                        return month;
                    });
                    setCertificateTrends(trends);

                    toast.success("Certificates loaded successfully");
                } else {
                    throw new Error(data.error || "Failed to fetch certificates.");
                }

            } catch (error) {
                toast.error("Error fetching certificates.");
            } finally {
                setLoading(false);
            }
        };

        const fetchStats = async () => {
            try {
                const response = await fetch("/admin/stats");
                const data = await response.json();
                if (response.ok) {
                    setStats(data);
                    toast.success("Stats loaded successfully");
                } else {
                    throw new Error(data.error || "Failed to fetch stats.");
                }
            } catch (error) {
                toast.error("Error fetching stats");
            }
        };


        fetchCertificates();
        fetchStats();
    }, []);

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


    // Trends chart (certificates issued over months)
    const trendsData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
            {
                label: "Certificates Issued",
                data: certificateTrends.reduce((acc, month) => {
                    acc[month - 1] = acc[month - 1] + 1 || 1;
                    return acc;
                }, new Array(12).fill(0)),
                borderColor: "#FFE662",
                backgroundColor: "#FFE66280",
                tension: 0.4,
                fill: true,
            },
        ],
    };

    // Certificate status distribution (Pie chart)
    const certificateStatusData = {
        labels: ["Active", "Blocked", "Issued Today"],
        datasets: [
            {
                data: [stats.total - stats.blocked, stats.blocked, stats.today],
                backgroundColor: ["#4CAF50", "#FF5722", "#FFE662"],
                borderColor: ["#4CAF50", "#FF5722", "#FFE662"],
                borderWidth: 1,
            },
        ],
    };

    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="flex min-h-screen bg-[#2d2d2d] text-white">
                {/* Sidebar */}
                <AdminSidebar activeItem="Dashboard" />

                {/* Main content area */}
                <main className="flex-1 overflow-y-auto p-6">
                    {/* Top bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 mb-8">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#FFE662]">
                                Dashboard
                            </h1>
                            <p className="text-gray-400">Overview of your certificate activity</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            {/* Search input */}
                            <div className="relative flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="absolute left-3 w-4 h-4 text-gray-500"
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
                                    className="pl-10 pr-4 py-2 rounded-lg bg-[#3a3a3a] text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFE662]"
                                />
                            </div>
                            {/* Date display (can be replaced with a date picker) */}
                            <div className="flex items-center space-x-2 text-gray-400">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5 text-[#FFE662]"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>{new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>


                    {/* Stats summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        <div className="bg-[#333] p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm text-gray-400">Total</h3>
                            </div>
                            <div className="text-3xl font-bold text-[#FFE662]">{stats.total ?? '-'}</div>
                        </div>
                        <div className="bg-[#333] p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm text-gray-400">Blocked</h3>
                            </div>
                            <div className="text-3xl font-bold text-[#FFE662]">{stats.blocked ?? '-'}</div>
                        </div>
                        <div className="bg-[#333] p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm text-gray-400">Issued Today</h3>
                            </div>
                            <div className="text-3xl font-bold text-[#FFE662]">{stats.today ?? '-'}</div>
                        </div>
                    </div>

                    {/* Certificate charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Trends chart */}
                        <div className="bg-[#333] p-6 rounded-xl shadow-md">
                            <h3 className="text-lg font-semibold text-[#FFE662] mb-4">Certificate Issued Trends</h3>
                            <div style={{ height: '300px' }} className="relative">
                                <Line
                                    data={trendsData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false, // Ensures it can adjust based on the container
                                    }}
                                />
                            </div>
                        </div>

                        {/* Certificate status chart */}
                        <div className="bg-[#333] p-6 rounded-xl shadow-md">
                            <h3 className="text-lg font-semibold text-[#FFE662] mb-4">Certificate Status Distribution</h3>
                            <div style={{ height: '300px' }} className="relative">
                                <Pie
                                    data={certificateStatusData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false, // Allow chart to resize based on its container
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Certificate table and extra panel */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Certificates Table */}
                        <div className="lg:col-span-2 bg-[#333] p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                            <h2 className="text-xl font-semibold text-[#FFE662] mb-5">
                                Recent Certificates
                            </h2>
                            {loading ? (
                                <p>Loading certificates...</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-600 text-gray-400">
                                                <th className="py-2">Certificate ID</th>
                                                <th className="py-2">Student Name</th>
                                                <th className="py-2">Course</th>
                                                <th className="py-2">Issued</th>
                                                <th className="py-2">Status</th>
                                                <th className="py-2">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredCertificates.slice(0, 6).map((certificate) => (
                                                <tr
                                                    key={certificate.id}
                                                    className="border-b border-gray-800 hover:bg-[#3a3a3a] transition-colors"
                                                >
                                                    <td className="py-2">
                                                        <span className="text-sm text-gray-300">
                                                            {certificate.certificate_number}
                                                        </span>
                                                    </td>
                                                    <td className="py-2">
                                                        <span className="text-sm text-gray-300">
                                                            {certificate.student_name}
                                                        </span>
                                                    </td>
                                                    <td className="py-2">
                                                        <span className="text-sm text-gray-300">
                                                            {certificate.course_name}
                                                        </span>
                                                    </td>
                                                    <td className="py-2">
                                                        <span className="text-sm text-gray-300">
                                                            {certificate.issued_date}
                                                        </span>
                                                    </td>
                                                    <td className="py-2">
                                                        <span
                                                            className={`text-xs font-semibold px-3 py-1 rounded-full ${certificate.blocked
                                                                ? "bg-red-600/20 text-red-400"
                                                                : "bg-green-600/20 text-green-400"
                                                                }`}
                                                        >
                                                            {certificate.blocked ? "Blocked" : "Active"}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 flex items-center space-x-2">
                                                        {/* Block/Unblock */}
                                                        <button
                                                            onClick={() =>
                                                                certificate.blocked
                                                                    ? handleUnblock(certificate.id)
                                                                    : handleBlock(certificate.id)
                                                            }
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#FFE662] text-black hover:bg-[#ffd94c] transition-colors"
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
                                                        {/* Delete */}
                                                        <button
                                                            onClick={() => handleDelete(certificate.id)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                                                            title="Delete"
                                                        >
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
                                                                <path d="M3 6h18" />
                                                                <path d="M8 6v12" />
                                                                <path d="M16 6v12" />
                                                                <path d="M5 6l1-2h12l1 2" />
                                                            </svg>
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

                        {/* Additional widget (e.g., trends / projects in progress) */}
                        <div className="bg-[#333] p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                            <h3 className="text-lg font-semibold text-[#FFE662] mb-4">
                                Breakdown of Activity
                            </h3>
                            {/* Example minimalist chart using divs; replace with real chart if desired */}
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-1 text-sm">
                                        <span className="text-gray-300">Active</span>
                                        <span className="text-gray-300">
                                            {stats.total - stats.blocked} ({stats.total ? Math.round((stats.total - stats.blocked) / stats.total * 100) : 0}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-600 h-2 rounded-full">
                                        <div
                                            className="h-full bg-green-500 rounded-full"
                                            style={{
                                                width: `${stats.total ? ((stats.total - stats.blocked) / stats.total) * 100 : 0}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1 text-sm">
                                        <span className="text-gray-300">Blocked</span>
                                        <span className="text-gray-300">
                                            {stats.blocked} ({stats.total ? Math.round((stats.blocked / stats.total) * 100) : 0}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-600 h-2 rounded-full">
                                        <div
                                            className="h-full bg-red-500 rounded-full"
                                            style={{
                                                width: `${stats.total ? (stats.blocked / stats.total) * 100 : 0}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1 text-sm">
                                        <span className="text-gray-300">Issued Today</span>
                                        <span className="text-gray-300">
                                            {stats.today} ({stats.total ? Math.round((stats.today / stats.total) * 100) : 0}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-600 h-2 rounded-full">
                                        <div
                                            className="h-full bg-yellow-500 rounded-full"
                                            style={{
                                                width: `${stats.total ? (stats.today / stats.total) * 100 : 0}%`,
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
