import React, { useState, useEffect } from "react";
import { router, Head } from "@inertiajs/react";
import toast from "react-hot-toast";
import AdminSidebar from "@/Components/AdminSidebar";
import axios from "axios";
import moment from "moment";

const AdminCertificates = ({ certificates = [], students = [], courses = [] }) => {
    const [certificatesList, setCertificatesList] = useState(certificates);
    const [filteredCertificates, setFilteredCertificates] = useState(certificates);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [newCertificate, setNewCertificate] = useState({
        student_id: "",
        course_id: "",
        issued_date: new Date().toISOString().split("T")[0],
        certificate_number: "",
    });
    const [selectedCertificate, setSelectedCertificate] = useState(null);

    useEffect(() => {
        setFilteredCertificates(certificates);
    }, [certificates]);

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);

        const filtered = certificatesList.filter((certificate) => {
            // Use the relationship data if available, otherwise fallback to the stored names
            const studentName = certificate.student
                ? `${certificate.student.first_name} ${certificate.student.last_name}`
                : certificate.student_name;

            const courseName = certificate.course
                ? certificate.course.name
                : certificate.course_name;

            return (
                studentName.toLowerCase().includes(value) ||
                certificate.certificate_number.toLowerCase().includes(value) ||
                courseName.toLowerCase().includes(value)
            );
        });
        setFilteredCertificates(filtered);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Get the student and course names
            const student = students.find(s => s.id === parseInt(newCertificate.student_id));
            const course = courses.find(c => c.id === parseInt(newCertificate.course_id));

            if (!student || !course) {
                toast.error("Please select a valid student and course");
                setLoading(false);
                return;
            }

            const response = await axios.post("/certificate/store", {
                name: `${student.first_name} ${student.last_name}`,
                course: course.name,
                issued_date: newCertificate.issued_date,
            });

            if (response.status === 200) {
                toast.success("Certificate created successfully!");
                setIsCreating(false);
                setNewCertificate({
                    student_id: "",
                    course_id: "",
                    issued_date: new Date().toISOString().split("T")[0],
                    certificate_number: "",
                });
                // Refresh certificates from server
                router.reload();
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
            student_id: certificate.student_id?.toString() || "",
            course_id: certificate.course_id?.toString() || "",
            issued_date: certificate.issued_date,
            certificate_number: certificate.certificate_number,
        });
        setIsCreating(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Get the student and course names
            const student = students.find(s => s.id === parseInt(newCertificate.student_id));
            const course = courses.find(c => c.id === parseInt(newCertificate.course_id));

            if (!student || !course) {
                toast.error("Please select a valid student and course");
                setLoading(false);
                return;
            }

            const response = await axios.post(`/certificate/update/${selectedCertificate.id}`, {
                name: `${student.first_name} ${student.last_name}`,
                course: course.name,
                issued_date: newCertificate.issued_date,
            });

            if (response.status === 200) {
                toast.success("Certificate updated successfully!");
                setIsCreating(false);
                setSelectedCertificate(null);
                setNewCertificate({
                    student_id: "",
                    course_id: "",
                    issued_date: new Date().toISOString().split("T")[0],
                    certificate_number: "",
                });
                // Refresh certificates from server
                router.reload();
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
            await router.delete(`/certificate/destroy/${id}`);
            toast.success("Certificate deleted successfully");
            setCertificatesList(certificatesList.filter((cert) => cert.id !== id));
            setFilteredCertificates(filteredCertificates.filter((cert) => cert.id !== id));
        } catch (error) {
            toast.error("Error deleting certificate");
        } finally {
            setLoading(false);
        }
    };

    const handleBlock = async (id) => {
        setLoading(true);
        try {
            await router.post(`/certificate/block/${id}`);
            toast.success("Certificate blocked!");
            setCertificatesList(certificatesList.map((cert) => (cert.id === id ? { ...cert, blocked: true } : cert)));
            setFilteredCertificates(filteredCertificates.map((cert) => (cert.id === id ? { ...cert, blocked: true } : cert)));
        } catch (error) {
            toast.error("Error blocking certificate");
        } finally {
            setLoading(false);
        }
    };

    const handleUnblock = async (id) => {
        setLoading(true);
        try {
            await router.post(`/certificate/unblock/${id}`);
            toast.success("Certificate unblocked!");
            setCertificatesList(certificatesList.map((cert) => (cert.id === id ? { ...cert, blocked: false } : cert)));
            setFilteredCertificates(filteredCertificates.map((cert) => (cert.id === id ? { ...cert, blocked: false } : cert)));
        } catch (error) {
            toast.error("Error unblocking certificate");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (id) => {
        window.open(`/certificate/downloadPDF/${id}`, '_blank');
    };

    // Helper function to get student name by ID
    const getStudentName = (certificate) => {
        // Use the relationship data if available, otherwise fallback to the stored name
        if (certificate.student) {
            return `${certificate.student.first_name} ${certificate.student.last_name}`;
        }
        return certificate.student_name || 'Unknown Student';
    };

    // Helper function to get course name by ID
    const getCourseName = (certificate) => {
        // Use the relationship data if available, otherwise fallback to the stored name
        if (certificate.course) {
            return certificate.course.name;
        }
        return certificate.course_name || 'Unknown Course';
    };

    // Get status color
    const getStatusColor = (blocked) => {
        return blocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400';
    };

    return (
        <>
            <Head title="Admin Certificates" />
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
                <AdminSidebar activeItem="Certificates" isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                {/* Main content area */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {/* Top bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 mb-6 lg:mb-8">
                        <div className="mt-12 lg:mt-0">
                            <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                                Manage Certificates
                            </h1>
                            <p className="text-gray-400 text-sm lg:text-base mt-2">Manage and view all your certificates</p>
                        </div>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create New Certificate
                        </button>
                    </div>

                    {/* Search bar */}
                    <div className="mb-6 lg:mb-8">
                        <div className="relative max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search certificates..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Certificates Table */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                        </div>
                    ) : (
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-700">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-700 overflow-hidden">
                                    <thead className="bg-gray-800/50 overflow-hidden">
                                        <tr>
                                            <th scope="col" className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Certificate ID
                                            </th>
                                            <th scope="col" className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Student Name
                                            </th>
                                            <th scope="col" className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                                                Course
                                            </th>
                                            <th scope="col" className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">
                                                Issued Date
                                            </th>
                                            <th scope="col" className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-4 lg:px-6 py-3 lg:py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {filteredCertificates.map((certificate) => (
                                            <tr key={certificate.id} className="hover:bg-gray-800/30 transition-colors duration-200">
                                                <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm font-medium text-gray-300">
                                                    {certificate.certificate_number}
                                                </td>
                                                <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-white font-bold text-xs">
                                                            {getStudentName(certificate).charAt(0)}
                                                        </div>
                                                        <div className="ml-3 lg:ml-4">
                                                            <div className="text-xs lg:text-sm font-medium text-white">
                                                                {getStudentName(certificate)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-300 hidden sm:table-cell">
                                                    {getCourseName(certificate)}
                                                </td>
                                                <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-300 hidden md:table-cell">
                                                    {moment(certificate.issued_date).format("MMM Do, YYYY")}
                                                </td>
                                                <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                                                    <span className={`px-2 lg:px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(certificate.blocked)}`}>
                                                        {certificate.blocked ? "Blocked" : "Active"}
                                                    </span>
                                                </td>
                                                <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-right text-xs lg:text-sm font-medium">
                                                    <div className="flex justify-end space-x-1 lg:space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(certificate)}
                                                            className="text-yellow-500 hover:text-yellow-400 transition-colors duration-200"
                                                            title="Edit"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                certificate.blocked
                                                                    ? handleUnblock(certificate.id)
                                                                    : handleBlock(certificate.id)
                                                            }
                                                            className={`${certificate.blocked ? "text-green-500 hover:text-green-400" : "text-yellow-500 hover:text-yellow-400"} transition-colors duration-200`}
                                                            title={certificate.blocked ? "Unblock" : "Block"}
                                                        >
                                                            {certificate.blocked ? (
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                                </svg>
                                                            ) : (
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownload(certificate.id)}
                                                            className="text-blue-500 hover:text-blue-400 transition-colors duration-200"
                                                            title="Download"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0H8m4 0h4m-4-8h4M4 4h4m0 0v4" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(certificate.id)}
                                                            className="text-red-500 hover:text-red-400 transition-colors duration-200"
                                                            title="Delete"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

                            {filteredCertificates.length === 0 && (
                                <div className="text-center py-12">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-400">No certificates found</h3>
                                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search or create a new certificate.</p>
                                    <div className="mt-6">
                                        <button
                                            onClick={() => setIsCreating(true)}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Create New Certificate
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Modal for Create and Edit Certificate */}
            {isCreating && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
                    <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 lg:p-8 border border-gray-700">
                        <h3 className="text-xl lg:text-2xl font-bold text-white mb-6">
                            {selectedCertificate ? "Edit Certificate" : "Create New Certificate"}
                        </h3>
                        <form onSubmit={selectedCertificate ? handleUpdate : handleCreate}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 mb-2 text-sm">Student</label>
                                    <select
                                        value={newCertificate.student_id}
                                        onChange={(e) => setNewCertificate({ ...newCertificate, student_id: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                                        required
                                    >
                                        <option value="">Select a student</option>
                                        {students && students.map(student => (
                                            <option key={student.id} value={student.id}>
                                                {student.first_name} {student.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2 text-sm">Course</label>
                                    <select
                                        value={newCertificate.course_id}
                                        onChange={(e) => setNewCertificate({ ...newCertificate, course_id: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                                        required
                                    >
                                        <option value="">Select a course</option>
                                        {courses && courses.map(course => (
                                            <option key={course.id} value={course.id}>
                                                {course.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2 text-sm">Issued Date</label>
                                    <input
                                        type="date"
                                        value={newCertificate.issued_date}
                                        onChange={(e) => setNewCertificate({ ...newCertificate, issued_date: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2 text-sm">Certificate Number</label>
                                    <p className="text-gray-400 text-sm mb-2">
                                        It will be automatically generated on the server
                                    </p>
                                    <input
                                        type="text"
                                        disabled={true}
                                        value={newCertificate.certificate_number}
                                        onChange={(e) =>
                                            setNewCertificate({ ...newCertificate, certificate_number: e.target.value })
                                        }
                                        className="w-full bg-gray-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between mt-8 space-y-3 sm:space-y-0">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg transition-all duration-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-medium py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50"
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
