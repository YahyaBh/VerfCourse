import React, { useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import { Download, Eye } from "lucide-react";
import toast from "react-hot-toast";

const Certificate = ({ certificate, error }) => {
    const handleDownload = () => {
        if (certificate?.id) {
            window.open(`/certificates/${certificate.id}/download`, "_blank");
        }
    };


    useEffect(() => {

        if (certificate) {
            toast.success(`Certificate for ${certificate.student_name} is available!`, {
                duration: 5000,
            });
            document.title = `${certificate.student_name} - Certificate Verification`;
        } else {
            toast.error("Certificate not found or invalid ID.", {
                duration: 5000,
            });
            document.title = "Certificate Verification — Webina";
        }

    }, []);

    return (
        <>
            <Head title="Certificate Verification — Webina" />
            <div className="relative min-h-screen bg-[#0f0f10] text-white flex flex-col justify-between">
                {/* Background gradient glow */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(60% 50% at 70% 10%, rgba(255,230,98,0.12) 0%, rgba(255,230,98,0.04) 45%, rgba(255,230,98,0) 70%)",
                    }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,15,16,0)_0%,rgba(15,15,16,0.6)_30%,#0f0f10_75%)]" />

                {/* Header */}
                <header className="relative z-10">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
                        <div className="flex items-center gap-3">
                            <div className="grid size-10 place-items-center rounded-xl bg-[#FFE662]/10 ring-1 ring-white/10">
                                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                                    <path
                                        d="M4 12L12 4l8 8-8 8-8-8Z"
                                        stroke="#FFE662"
                                        strokeWidth="1.5"
                                    />
                                    <circle cx="12" cy="12" r="2" fill="#FFE662" />
                                </svg>
                            </div>
                            <div className="text-lg font-semibold tracking-wide">
                                Webina Certificates
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Link
                                href="/"
                                className="rounded-lg px-3 py-2 text-sm text-white/80 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-white"
                            >
                                Back to Home
                            </Link>

                            <Link
                                href="https://webinadigital.com/course"
                                className="rounded-lg px-3 py-2 text-sm text-white/80 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-white"
                            >
                                Go To Course
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Main */}
                <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-12">
                    <div className="w-full max-w-3xl">


                        {certificate ? <h1 className=" flex justify-center gap-2 items-center align-content-center mb-8 text-center text-4xl font-extrabold text-green-500 ">
                            <svg
                                className={`h-12 w-12 ${certificate ? "text-green-500" : "text-red-500"} animate-pulse`}
                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Certificate Available
                        </h1> :
                            <h1 className=" flex justify-center gap-2 items-center align-content-center mb-8 text-center text-4xl font-extrabold text-red-500 ">
                                <svg className="h-12 w-12 text-red-500 animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 100 18 9 9 0 000-18z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 100 18 9 9 0 000-18z" />
                                </svg>
                                Certificate Not Available
                            </h1>}

                        {error ? (
                            <div className="rounded-2xl bg-red-600/90 px-6 py-4 text-center text-white shadow-lg backdrop-blur-md">
                                {error}
                            </div>
                        ) : certificate ? (
                            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center shadow-2xl backdrop-blur-md">
                                <h2 className="mb-4 text-3xl font-bold text-[#FFE662] capitalize">
                                    {certificate.student_name}
                                </h2>
                                <p className="text-lg text-white/90 capitalize">
                                    successfully completed{" "}

                                    <span className="font-semibold text-white">
                                        {certificate.course_name}
                                    </span>

                                    <br />

                                    <a className="flex justify-center align-items-center gap-2 text-[#FFE662] hover:underline py-3" href={`/WEBINA COURSE MODULES FOR FULL STACK WEB DEV.pdf`}    >
                                        Download Modules of the course <Download />
                                    </a>
                                </p>
                                <div className="mt-6 space-y-2 text-white/80">
                                    <p>
                                        <span className="font-semibold text-white">
                                            Certificate Number:
                                        </span>{" "}
                                        {certificate.certificate_number}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-white">
                                            Issued on:
                                        </span>{" "}
                                        {new Date(
                                            certificate.issued_date
                                        ).toLocaleDateString()}
                                    </p>
                                    {/* expiry date */}
                                    {certificate.expiry_date ? (
                                        <p>
                                            <span className="font-semibold text-white">
                                                Expires on:
                                            </span>{" "}
                                            {new Date(
                                                certificate.expiry_date
                                            ).toLocaleDateString()}
                                        </p>
                                    ) : (<p>
                                        <span className="font-semibold text-white">
                                            Expires on: -
                                        </span>

                                    </p>)}
                                </div>

                                {/* Buttons */}
                                <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                                    <button
                                        onClick={handleDownload}
                                        className="rounded-xl bg-[#FFE662] px-6 py-3 font-semibold text-black shadow-lg transition hover:scale-105 hover:brightness-95"
                                    >
                                        Download PDF
                                    </button>
                                    <Link
                                        href="/"
                                        className="rounded-xl border border-[#FFE662] px-6 py-3 font-semibold text-[#FFE662] shadow-lg transition hover:bg-[#FFE662] hover:text-black"
                                    >
                                        Back Home
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-white/70">
                                Your certificate details will appear here after
                                verification.
                            </p>
                        )}
                    </div>
                </main>

                {/* Footer */}
                <footer className="relative z-10 border-t border-white/10 py-6 text-center text-xs text-white/60">
                    © {new Date().getFullYear()} Webina Digital LTD. All rights reserved.
                </footer>
            </div>
        </>
    );
};

export default Certificate;
