// resources/js/Pages/Admin/Payments.jsx
import React, { useState, useEffect } from "react";
import { router, Head, Link } from "@inertiajs/react";
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

const Payments = ({ payments: initialPayments = [], students = [], courses = [], stats = {} }) => {
    const [payments, setPayments] = useState(initialPayments);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredPayments, setFilteredPayments] = useState(initialPayments);
    const [form, setForm] = useState({
        student_id: '',
        course_id: '',
        amount: '',
        method: 'cash',
        payment_for_month: '',
        reference: '',
        notes: ''
    });
    const [editingPayment, setEditingPayment] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [chartData, setChartData] = useState({
        monthlyPayments: new Array(12).fill(0),
        paymentMethods: { cash: 0, card: 0, bank_transfer: 0 }
    });

    // Load chart data
    useEffect(() => {
        fetch('/payments/stats')
            .then(response => response.json())
            .then(data => {
                setChartData({
                    monthlyPayments: data.monthlyPayments,
                    paymentMethods: data.paymentMethods
                });
            })
            .catch(error => {
                console.error('Error fetching chart data:', error);
            });
    }, []);

    // Handle search
    useEffect(() => {
        if (searchTerm === '') {
            setFilteredPayments(payments);
        } else {
            const filtered = payments.filter((payment) => {
                return (
                    payment.student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    payment.student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    payment.course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    payment.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    payment.status.toLowerCase().includes(searchTerm.toLowerCase())
                );
            });
            setFilteredPayments(filtered);
        }
    }, [searchTerm, payments]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // Handle edit form input changes
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditingPayment(prev => ({ ...prev, [name]: value }));
    };

    // Submit new payment
    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        router.post('/payments', form, {
            onSuccess: (page) => {
                setPayments(page.props.payments);
                setFilteredPayments(page.props.payments);
                setForm({
                    student_id: '',
                    course_id: '',
                    amount: '',
                    method: 'cash',
                    payment_for_month: '',
                    reference: '',
                    notes: ''
                });
                toast.success("Payment recorded successfully");
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

    // Update payment
    const handleUpdate = (e) => {
        e.preventDefault();
        setLoading(true);

        router.put(`/payments/${editingPayment.id}`, editingPayment, {
            onSuccess: (page) => {
                setPayments(page.props.payments);
                setFilteredPayments(page.props.payments);
                setShowEditModal(false);
                setEditingPayment(null);
                toast.success("Payment updated successfully");
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

    // Delete payment
    const handleDelete = (id) => {
        if (!window.confirm("Are you sure you want to delete this payment?")) return;

        router.delete(`/payments/${id}`, {
            onSuccess: (page) => {
                setPayments(page.props.payments);
                setFilteredPayments(page.props.payments);
                toast.success("Payment deleted successfully");
            },
            onError: (errors) => {
                Object.values(errors).forEach(error => {
                    toast.error(error);
                });
            }
        });
    };

    // Update payment status
    const updateStatus = (id, status) => {
        router.post(`/payments/${id}/status`, { status }, {
            onSuccess: (page) => {
                setPayments(page.props.payments);
                setFilteredPayments(page.props.payments);
                toast.success("Payment status updated successfully");
            },
            onError: (errors) => {
                Object.values(errors).forEach(error => {
                    toast.error(error);
                });
            }
        });
    };

    // Generate invoice for a payment
    const generateInvoice = (paymentId) => {
        router.post(`/payments/${paymentId}/generate-invoice`, {}, {
            onSuccess: (page) => {
                setPayments(page.props.payments);
                setFilteredPayments(page.props.payments);
                toast.success("Invoice generated successfully");
            },
            onError: (errors) => {
                Object.values(errors).forEach(error => {
                    toast.error(error);
                });
            }
        });
    };

    // Open edit modal
    const openEditModal = (payment) => {
        setEditingPayment({ ...payment });
        setShowEditModal(true);
    };

    // Payment method distribution (Pie chart)
    const paymentMethodData = {
        labels: ["Cash", "Card", "Bank Transfer"],
        datasets: [
            {
                data: [
                    chartData.paymentMethods.cash || 0,
                    chartData.paymentMethods.card || 0,
                    chartData.paymentMethods.bank_transfer || 0
                ],
                backgroundColor: [
                    "rgba(74, 222, 128, 0.8)", // Green for Cash
                    "rgba(96, 165, 250, 0.8)",  // Blue for Card
                    "rgba(253, 224, 71, 0.8)"   // Yellow for Bank Transfer
                ],
                borderColor: [
                    "rgba(74, 222, 128, 1)",
                    "rgba(96, 165, 250, 1)",
                    "rgba(253, 224, 71, 1)"
                ],
                borderWidth: 1,
            },
        ],
    };

    // Monthly payments (Bar chart)
    const monthlyPaymentsData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
            {
                label: "Monthly Payments ($)",
                data: chartData.monthlyPayments,
                backgroundColor: "rgba(253, 224, 71, 0.6)",
                borderColor: "rgba(253, 224, 71, 1)",
                borderWidth: 1,
            },
        ],
    };

    return (
        <>
            <Head title="Student Payments" />
            <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
                {/* Sidebar */}
                <AdminSidebar activeItem="Payments" />

                {/* Main content area */}
                <main className="flex-1 overflow-y-auto p-6">
                    {/* Top bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 mb-8">
                        <div>
                            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                                Student Payments
                            </h1>
                            <p className="text-gray-400">Manage student payments and invoices</p>
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
                                    placeholder="Search payments..."
                                    className="pl-10 pr-4 py-3 rounded-lg bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                                <span>{new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm text-gray-400">Total Payments</h3>
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-green-500">{stats.totalPayments}</div>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm text-gray-400">Completed Payments</h3>
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-blue-500">{stats.completedPayments}</div>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm text-gray-400">Pending Payments</h3>
                                <div className="p-2 bg-yellow-500/20 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-yellow-500">{stats.pendingPayments}</div>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm text-gray-400">Total Revenue</h3>
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-purple-500">${stats.totalRevenue?.toFixed(2)}</div>
                        </div>
                    </div>

                    {/* Payment charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Monthly payments chart */}
                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-md">
                            <h3 className="text-lg font-semibold text-yellow-500 mb-4">Monthly Payment Amounts</h3>
                            <div style={{ height: '300px' }} className="relative">
                                <Bar
                                    data={monthlyPaymentsData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                labels: {
                                                    color: '#D1D5DB'
                                                }
                                            },
                                        },
                                        scales: {
                                            x: {
                                                grid: {
                                                    color: 'rgba(209, 213, 219, 0.1)'
                                                },
                                                ticks: {
                                                    color: '#D1D5DB'
                                                }
                                            },
                                            y: {
                                                grid: {
                                                    color: 'rgba(209, 213, 219, 0.1)'
                                                },
                                                ticks: {
                                                    color: '#D1D5DB',
                                                    callback: function (value) {
                                                        return '$' + value;
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Payment method chart */}
                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-md">
                            <h3 className="text-lg font-semibold text-yellow-500 mb-4">Payment Method Distribution</h3>
                            <div style={{ height: '300px' }} className="relative">
                                <Pie
                                    data={paymentMethodData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'right',
                                                labels: {
                                                    color: '#D1D5DB'
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Create Payment Form */}
                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow mb-8">
                        <h2 className="text-xl font-semibold text-yellow-500 mb-5">Add New Payment</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="student_id" className="block text-sm font-medium text-gray-400 mb-1">Student</label>
                                    <select
                                        id="student_id"
                                        name="student_id"
                                        value={form.student_id}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    >
                                        <option value="">Select Student</option>
                                        {students.map(s => (
                                            <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="course_id" className="block text-sm font-medium text-gray-400 mb-1">Course</label>
                                    <select
                                        id="course_id"
                                        name="course_id"
                                        value={form.course_id}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    >
                                        <option value="">Select Course</option>
                                        {courses.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="amount" className="block text-sm font-medium text-gray-400 mb-1">Amount</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-400 sm:text-sm">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            id="amount"
                                            name="amount"
                                            value={form.amount}
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
                                    <label htmlFor="payment_for_month" className="block text-sm font-medium text-gray-400 mb-1">Payment For Month</label>
                                    <input
                                        type="month"
                                        id="payment_for_month"
                                        name="payment_for_month"
                                        value={form.payment_for_month}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="method" className="block text-sm font-medium text-gray-400 mb-1">Payment Method</label>
                                    <select
                                        id="method"
                                        name="method"
                                        value={form.method}
                                        onChange={handleChange}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="card">Card</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="reference" className="block text-sm font-medium text-gray-400 mb-1">Reference</label>
                                    <input
                                        type="text"
                                        id="reference"
                                        name="reference"
                                        value={form.reference}
                                        onChange={handleChange}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        placeholder="Transaction reference"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    placeholder="Additional notes"
                                ></textarea>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Add Payment'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Payments Table */}
                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                        <h2 className="text-xl font-semibold text-yellow-500 mb-5">All Payments</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-600 text-gray-400">
                                        <th className="py-3 px-4">Student</th>
                                        <th className="py-3 px-4">Course</th>
                                        <th className="py-3 px-4">Month</th>
                                        <th className="py-3 px-4">Amount</th>
                                        <th className="py-3 px-4">Method</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4">Invoice</th>
                                        <th className="py-3 px-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPayments.map(p => (
                                        <tr
                                            key={p.id}
                                            className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                                        >
                                            <td className="py-3 px-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-white font-bold text-xs">
                                                        {p.student.first_name.charAt(0)}{p.student.last_name.charAt(0)}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-300">{p.student.first_name} {p.student.last_name}</div>
                                                        <div className="text-xs text-gray-500">{p.student.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-sm text-gray-300">{p.course.name}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-sm text-gray-300">
                                                    {new Date(p.payment_for_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-sm font-medium text-gray-300">${p.amount}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-600/20 text-blue-400">
                                                    {p.method}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.status === 'completed' ? 'bg-green-600/20 text-green-400' :
                                                        p.status === 'pending' ? 'bg-yellow-600/20 text-yellow-400' :
                                                            'bg-red-600/20 text-red-400'
                                                    }`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {p.invoice
                                                    ? <Link href={`/invoices/${p.invoice.id}/download`} className="text-green-400 hover:text-green-300 text-sm font-medium">Download</Link>
                                                    : <button onClick={() => generateInvoice(p.id)} className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">Generate</button>
                                                }
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center space-x-2">
                                                    {/* Status toggle */}
                                                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                                        <input
                                                            type="checkbox"
                                                            id={`status-toggle-${p.id}`}
                                                            className="sr-only"
                                                            checked={p.status === 'completed'}
                                                            onChange={(e) => updateStatus(p.id, e.target.checked ? 'completed' : 'pending')}
                                                        />
                                                        <div className={`block w-10 h-6 rounded-full ${p.status === 'completed' ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${p.status === 'completed' ? 'transform translate-x-4' : ''}`}></div>
                                                    </div>

                                                    {/* Edit button */}
                                                    <button
                                                        onClick={() => openEditModal(p)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                                                        title="Edit"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>

                                                    {/* Delete button */}
                                                    <button
                                                        onClick={() => handleDelete(p.id)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700"
                                                        title="Delete"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredPayments.length === 0 && (
                                        <tr>
                                            <td colSpan="8" className="py-4 text-center text-gray-400">
                                                No payments found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {/* Edit Payment Modal */}
            {showEditModal && editingPayment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-yellow-500">Edit Payment</h3>
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
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Student</label>
                                    <select
                                        name="student_id"
                                        value={editingPayment.student_id}
                                        onChange={handleEditChange}
                                        required
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    >
                                        {students.map(s => (
                                            <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Course</label>
                                    <select
                                        name="course_id"
                                        value={editingPayment.course_id}
                                        onChange={handleEditChange}
                                        required
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    >
                                        {courses.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Amount</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-400 sm:text-sm">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="amount"
                                            value={editingPayment.amount}
                                            onChange={handleEditChange}
                                            required
                                            className="block w-full pl-7 pr-12 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Payment For Month</label>
                                    <input
                                        type="month"
                                        name="payment_for_month"
                                        value={editingPayment.payment_for_month}
                                        onChange={handleEditChange}
                                        required
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Payment Method</label>
                                    <select
                                        name="method"
                                        value={editingPayment.method}
                                        onChange={handleEditChange}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="card">Card</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={editingPayment.status}
                                        onChange={handleEditChange}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="completed">Completed</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Reference</label>
                                    <input
                                        type="text"
                                        name="reference"
                                        value={editingPayment.reference || ''}
                                        onChange={handleEditChange}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        placeholder="Transaction reference"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
                                    <textarea
                                        name="notes"
                                        value={editingPayment.notes || ''}
                                        onChange={handleEditChange}
                                        rows="3"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    ></textarea>
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
                                        {loading ? 'Updating...' : 'Update Payment'}
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

export default Payments;
