import React, { useState, useEffect } from "react";
import { router, Head } from "@inertiajs/react";
import toast from "react-hot-toast";
import AdminSidebar from "@/Components/AdminSidebar";
import axios from "axios";
import moment from "moment";

const AdminCertificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [filteredCertificates, setFilteredCertificates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [newCertificate, setNewCertificate] = useState({
        student_name: "",
        course_name: "Full stack web development",
        issued_date: new Date().toISOString().split("T")[0],
        certificate_number: "",
        pdf_file: null,
    });
    const [selectedCertificate, setSelectedCertificate] = useState(null);

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        setLoading(true);
        try {
            const response = await fetch("/certificates");
            const data = await response.json();

            if (response.ok) {
                setCertificates(data);
                setFilteredCertificates(data);
            } else {
                throw new Error(data.error || "Failed to fetch certificates.");
            }
        } catch (error) {
            toast.error("Error fetching certificates.");
        } finally {
            setLoading(false);
        }
    };

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
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Prepare the form data
        const formData = new FormData();
        formData.append("name", newCertificate.student_name);
        formData.append("course", newCertificate.course_name);
        formData.append("issued_date", newCertificate.issued_date);

        formData.append("course_link", newCertificate.course_link || ""); // Optional
        if (newCertificate.pdf_file) {
            formData.append("pdf_file", newCertificate.pdf_file); // Add PDF file
        }

        try {
            const response = await axios.post("/certificate/create", formData, {
                headers: {
                    "Content-Type": "multipart/form-data", // Ensure it's sending FormData
                },
            });

            if (response.status === 200) {
                toast.success("Certificate created successfully!");
                setIsCreating(false);
                setNewCertificate({
                    student_name: "",
                    pdf_file: null,
                });
                fetchCertificates();
            } else {
                toast.error("Error creating certificate.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error creating certificate.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (certificate) => {
        setSelectedCertificate(certificate);
        setNewCertificate({
            student_name: certificate.student_name,
            course_name: certificate.course_name,
            issued_date: certificate.issued_date,
            certificate_number: certificate.certificate_number,
            pdf_file: null, // We don't prepopulate the PDF file here
        });
        setIsCreating(true); // Open the modal for editing
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("name", newCertificate.student_name);
        formData.append("course", newCertificate.course_name);
        formData.append("issued_date", newCertificate.issued_date);

        formData.append("course_link", newCertificate.course_link || ""); // Optional
        if (newCertificate.pdf_file) {
            formData.append("pdf_file", newCertificate.pdf_file); // Add PDF file
        }

        try {
            const response = await axios.post(`/certificate/update/${selectedCertificate.id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200) {
                toast.success("Certificate updated successfully!");
                setIsCreating(false);
                setSelectedCertificate(null);
                setNewCertificate({
                    student_name: "",
                    pdf_file: null,
                });
                fetchCertificates();
            } else {
                toast.error("Error updating certificate.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error updating certificate.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this certificate?")) return;

        setLoading(true);
        try {
            await router.delete(`/admin/certificate/${id}`);
            toast.success("Certificate deleted successfully");
            setCertificates(certificates.filter((cert) => cert.id !== id));
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
            toast.success("Certificate blocked!");
            setCertificates(certificates.map((cert) => (cert.id === id ? { ...cert, blocked: true } : cert)));
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
            toast.success("Certificate unblocked!");
            setCertificates(certificates.map((cert) => (cert.id === id ? { ...cert, blocked: false } : cert)));
        } catch (error) {
            toast.error("Error unblocking certificate");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head title="Admin Certificates" />
            <div className="flex min-h-screen bg-[#2d2d2d] text-white">
                {/* Sidebar */}
                <AdminSidebar activeItem="Certificates" />

                {/* Main content area */}
                <main className="flex-1 overflow-y-auto p-6">
                    {/* Top bar */}
                    <div className="flex justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-[#FFE662]">Manage Certificates</h1>
                            <p className="text-gray-400">Manage and view all your certificates</p>
                        </div>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="bg-[#FFE662] text-black py-2 px-4 rounded-lg hover:bg-[#ffd94c] transition-all"
                        >
                            Create New Certificate
                        </button>
                    </div>

                    {/* Search bar */}
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Search certificates..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="p-3 w-full bg-[#3a3a3a] rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFE662]"
                        />
                    </div>

                    {/* Certificates Table */}
                    {loading ? (
                        <p>Loading certificates...</p>
                    ) : (
                        <table className="min-w-full text-left text-gray-300">
                            <thead className="border-b border-gray-600">
                                <tr>
                                    <th className="py-3 px-4">Certificate ID</th>
                                    <th className="py-3 px-4">Student Name</th>
                                    <th className="py-3 px-4">Course</th>
                                    <th className="py-3 px-4">Student ID</th>
                                    <th className="py-3 px-4">Creation Date</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCertificates.map((certificate) => (
                                    <tr key={certificate.id} className="border-b border-gray-600 hover:bg-[#444]">
                                        <td className="py-3 px-4">{certificate.certificate_number}</td>
                                        <td className="py-3 px-4">{certificate.student_name}</td>
                                        <td className="py-3 px-4">{certificate.course_name}</td>
                                        <td className="py-3 px-4">{certificate.sudent_id ?? '-'}</td>
                                        <td className="py-3 px-4">{moment(certificate.created_at).format("MMMM Do YYYY, h:mm:ss a")}</td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-3 py-1 rounded-full ${certificate.blocked ? "bg-red-500" : "bg-green-500"} text-white`}
                                            >
                                                {certificate.blocked ? "Blocked" : "Active"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 flex space-x-3">
                                            <button
                                                onClick={() => handleEdit(certificate)}
                                                className="bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-all"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    certificate.blocked
                                                        ? handleUnblock(certificate.id)
                                                        : handleBlock(certificate.id)
                                                }
                                                className="bg-[#FFE662] text-black py-2 px-4 rounded-lg hover:bg-[#ffd94c] transition-all"
                                            >
                                                {certificate.blocked ? "Unblock" : "Block"}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(certificate.id)}
                                                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-all"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCertificates.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="py-4 text-center text-gray-400">
                                            No certificates found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </main>
            </div>

            {/* Modal for Create and Edit Certificate */}
            {isCreating && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-[#333] p-8 rounded-xl w-96">
                        <h3 className="text-2xl font-semibold text-[#FFE662] mb-6">
                            {selectedCertificate ? "Edit Certificate" : "Create New Certificate"}
                        </h3>
                        <form onSubmit={selectedCertificate ? handleUpdate : handleCreate}>
                            <div className="mb-4">
                                <label className="block text-gray-400">Student Name</label>
                                <input
                                    type="text"
                                    value={newCertificate.student_name}
                                    onChange={(e) => setNewCertificate({ ...newCertificate, student_name: e.target.value })}
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200 placeholder-gray-400"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400">Course Name</label>
                                <input
                                    type="text"
                                    value={newCertificate.course_name}
                                    onChange={(e) => setNewCertificate({ ...newCertificate, course_name: e.target.value })}
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200 placeholder-gray-400"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400">Issued Date</label>
                                <input
                                    type="date"
                                    value={newCertificate.issued_date}
                                    onChange={(e) => setNewCertificate({ ...newCertificate, issued_date: e.target.value })}
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200 placeholder-gray-400"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400">Certificate Number</label>
                                <p className="text-gray-200">
                                    It will be automatically generated on the server
                                </p>
                                <input
                                    type="text"
                                    disabled={true}
                                    value={newCertificate.certificate_number}
                                    onChange={(e) =>
                                        setNewCertificate({ ...newCertificate, certificate_number: e.target.value })
                                    }
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200 placeholder-gray-400 disabled:opacity-20"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400">Certificate Initial</label>
                                <input
                                    type="file"
                                    name="pdf_file"
                                    accept=".pdf"
                                    onChange={(e) => setNewCertificate({ ...newCertificate, pdf_file: e.target.files[0] })}
                                    className="w-full p-3 bg-[#3a3a3a] rounded-lg text-gray-200 placeholder-gray-400"
                                />
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="bg-gray-600 text-white py-2 px-4 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-[#FFE662] text-black py-2 px-4 rounded-lg hover:bg-[#ffd94c] transition-all disabled:opacity-10"
                                >
                                    {!loading ? (selectedCertificate ? "Update Certificate" : "Create Certificate") : "Processing..."}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminCertificates;
