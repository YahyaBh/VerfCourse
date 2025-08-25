import React, { useState } from 'react';

import { Inertia } from '@inertiajs/inertia';
import { InertiaLink, usePage } from '@inertiajs/inertia-react';

const Payments = () => {
    const { students, payments } = usePage().props;
    const [form, setForm] = useState({
        student_id: '',
        course_id: '',
        amount: '',
        method: 'cash',
        payment_for_month: ''
    });

    // Handle form input
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Submit new payment
    const handleSubmit = (e) => {
        e.preventDefault();
        Inertia.post('/payments', form);
    };

    // Generate invoice for a payment
    const generateInvoice = (paymentId) => {
        Inertia.post(`/payments/${paymentId}/generate-invoice`);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Student Payments</h1>

            {/* Create Payment Form */}
            <div className="bg-white shadow p-4 mb-6 rounded">
                <h2 className="font-semibold mb-2">Add Payment</h2>
                <form onSubmit={handleSubmit} className="space-y-2">
                    <select name="student_id" onChange={handleChange} required className="border p-2 rounded w-full">
                        <option value="">Select Student</option>
                        {students.map(s => (
                            <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                        ))}
                    </select>

                    <input type="number" name="amount" placeholder="Amount" onChange={handleChange} required className="border p-2 rounded w-full" />

                    <input type="month" name="payment_for_month" onChange={handleChange} required className="border p-2 rounded w-full" />

                    <select name="method" onChange={handleChange} className="border p-2 rounded w-full">
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="bank_transfer">Bank Transfer</option>
                    </select>

                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Add Payment</button>
                </form>
            </div>

            {/* Payments Table */}
            <div className="bg-white shadow p-4 rounded">
                <h2 className="font-semibold mb-2">All Payments</h2>
                <table className="w-full border-collapse border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2">Student</th>
                            <th className="border p-2">Course</th>
                            <th className="border p-2">Month</th>
                            <th className="border p-2">Amount</th>
                            <th className="border p-2">Method</th>
                            <th className="border p-2">Status</th>
                            <th className="border p-2">Invoice</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(p => (
                            <tr key={p.id}>
                                <td className="border p-2">{p.student.first_name} {p.student.last_name}</td>
                                <td className="border p-2">{p.course.title}</td>
                                <td className="border p-2">{new Date(p.payment_for_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</td>
                                <td className="border p-2">${p.amount}</td>
                                <td className="border p-2">{p.method}</td>
                                <td className="border p-2">{p.status}</td>
                                <td className="border p-2">
                                    {p.invoice
                                        ? <InertiaLink href={`/invoices/${p.invoice.id}/download`} className="text-green-600">Download</InertiaLink>
                                        : <button onClick={() => generateInvoice(p.id)} className="text-blue-600">Generate</button>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Payments;
