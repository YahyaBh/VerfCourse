import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import toast from "react-hot-toast";


export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const [code, setCode] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();


        const regex = /^WEBC-[A-Z0-9]{4}-[A-Z0-9]{5}$/;

        if (!regex.test(code)) {
            toast.error("Invalid Certificate ID format.");
            return;
        }

        setLoading(true);
        setResult(null);



        try {
            await router.post("/certificates/verify", { certificate_number: code });
        } catch (error) {
            toast.error("Verification failed. Please try again.");
            setResult({ success: false, message: "Something went wrong." });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        let value = e.target.value.toUpperCase();

        // Remove everything except letters/numbers
        value = value.replace(/[^A-Z0-9]/g, "");

        // Start with WEBC
        if (!value.startsWith("WEBC")) {
            value = "WEBC" + value.slice(0, 0); // always starts with WEBC
        }

        // Remove letters after WEBC
        let numbersOnly = value.slice(4).replace(/[^0-9]/g, "");

        // Build the formatted string
        if (numbersOnly.length <= 4) {
            value = "WEBC-" + numbersOnly;
        } else {
            value = "WEBC-" + numbersOnly.slice(0, 4) + "-" + numbersOnly.slice(4, 9);
        }

        // Limit total length
        if (value.length > 16) value = value.slice(0, 16);

        setCode(value);
    };


    return (
        <>
            <Head title="Webina — Verify Certificate" />
            <div className="relative min-h-screen bg-[#0f0f10] text-white">
                {/* Background */}
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
                                {/* Simple mark */}
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

                        <nav className="flex items-center gap-3 text-sm">
                            {auth?.user ? (
                                <>
                                    <Link
                                        href={route("dashboard")}
                                        className="rounded-lg px-3 py-2 text-white/80 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-white"
                                    >
                                        Dashboard
                                    </Link>

                                    <Link
                                        href={route("logout")}
                                        method="post"
                                        as="button"
                                        className="rounded-lg px-3 py-2 text-white/80 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-white"
                                    >
                                        Logout
                                    </Link>
                                </>



                            ) : (
                                <>
                                    <a
                                        href="https://webinadigital.com/course"
                                        target="_blank"
                                        className="rounded-lg px-3 py-2 text-white/80 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-white"
                                    >
                                        Visit Course
                                    </a>
                                    <Link
                                        href={route("login")}
                                        className="rounded-lg px-3 py-2 text-white/80 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-white"
                                    >
                                        Admin Login
                                    </Link>
                                    {/* <Link
                                        href={route("register")}
                                        className="rounded-lg px-3 py-2 text-white/80 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-white"
                                    >
                                        Register
                                    </Link> */}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero (sized to ~1820x750 container) */}
                <section className="relative z-10">
                    <div className="mx-auto max-w-[1820px] px-6">
                        <div className="mx-auto grid min-h-[750px] max-w-7xl grid-cols-1 items-center gap-10 py-10 lg:grid-cols-2">
                            {/* Left: copy + form */}
                            <div className="space-y-8">
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs tracking-wide ring-1 ring-white/10">
                                    <span className="inline-block size-1.5 rounded-full bg-[#FFE662]" />
                                    Instant verification · Secure · QR-enabled
                                </div>

                                <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                                    Verify your{" "}
                                    <span className="text-[#FFE662]">Webina</span> course
                                    certificate
                                </h1>

                                <p className="max-w-xl text-white/70">
                                    Enter the certificate ID (e.g.,{" "}
                                    <span className="font-mono text-white/90">
                                        WEBC-XXXX-XXXXX
                                    </span>
                                    ) or scan the QR code on your certificate to validate its
                                    authenticity in seconds.
                                </p>

                                {/* Verify form */}
                                <form
                                    onSubmit={handleVerify}
                                    className="flex w-full max-w-xl flex-col gap-3 sm:flex-row"
                                >
                                    <input
                                        type="text"
                                        required
                                        value={code}
                                        onChange={(e) => handleChange(e)}
                                        placeholder="Enter Certificate ID"
                                        className="uppercase w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-white placeholder-white/40 outline-none ring-0 transition focus:border-[#FFE662]/50"
                                    />

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="inline-flex items-center justify-center rounded-xl bg-[#FFE662] px-5 py-3 font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {loading ? "Verifying..." : "Verify"}
                                    </button>
                                </form>

                                {/* Quick links */}
                                <div className="flex flex-wrap gap-4 text-sm text-white/70">
                                    {/* <Link
                                        href="/certificates"
                                        className="rounded-lg px-3 py-2 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-white"
                                    >
                                        Browse Certificates
                                    </Link> */}
                                    <Link
                                        href="/login"
                                        className="rounded-lg px-3 py-2 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-white"
                                    >
                                        Admin Panel
                                    </Link>
                                    <Link
                                        href="https://webinadigital.com/course"
                                        className="rounded-lg px-3 py-2 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-white"
                                    >
                                        Help & FAQs
                                    </Link>
                                </div>
                            </div>

                            {/* Right: visual card */}
                            <div className="relative">
                                <div className="absolute -inset-6 -z-10 rounded-[28px] bg-gradient-to-tr from-[#FFE662]/10 to-transparent blur-2xl" />
                                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-md">
                                    <div className="grid gap-6 lg:grid-cols-2">
                                        {/* Certificate preview */}
                                        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                                            <div className="mb-3 text-sm text-white/60">
                                                Certificate preview
                                            </div>
                                            <div className="rounded-xl bg-gradient-to-b from-black/20 to-black/60 p-4 ring-1 ring-white/10">
                                                <div className="mb-2 text-xs uppercase tracking-wider text-white/50">
                                                    Webina Digital LTD
                                                </div>
                                                <div className="mb-4 text-lg font-semibold">
                                                    Certificate of Completion
                                                </div>
                                                <div className="mb-1 text-sm text-white/70">
                                                    Awarded to
                                                </div>
                                                <div className="mb-4 text-xl font-bold">
                                                    {result?.student_name || "-"}
                                                </div>
                                                <div className="text-xs text-white/50">
                                                    Course: Full Stack Web Development
                                                    <br />
                                                    ID: {result?.certificate_number || "WEBC-XXXX-XXXXX"}
                                                    <br />
                                                    Date: {result?.issued_date || "2025-XX-XX"}
                                                    <br />
                                                    100+ hours of training
                                                </div>
                                            </div>
                                        </div>

                                        {/* Feature bullets */}
                                        <div className="space-y-4">
                                            {[
                                                {
                                                    title: "Tamper-proof IDs",
                                                    desc: "Each certificate gets a unique, verifiable ID.",
                                                },
                                                {
                                                    title: "QR verification",
                                                    desc: "Scan from paper or screen to validate instantly.",
                                                },
                                                {
                                                    title: "Secure & Private",
                                                    desc: "Only essential data is shown on public pages.",
                                                },
                                                {
                                                    title: "PDF Downloads",
                                                    desc: "Students can save and share official PDFs.",
                                                },
                                            ].map((f) => (
                                                <div
                                                    key={f.title}
                                                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
                                                >
                                                    <div className="mt-0.5 grid size-6 place-items-center rounded-lg bg-[#FFE662]/15 ring-1 ring-[#FFE662]/30">
                                                        <span className="block size-2 rounded-full bg-[#FFE662]" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">{f.title}</div>
                                                        <div className="text-sm text-white/70">
                                                            {f.desc}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* CTA row */}
                                    <div className="mt-6 flex flex-wrap items-center gap-3">
                                        <Link
                                            href="https://webinadigital.com/course"
                                            className="rounded-xl bg-white/5 px-4 py-2 text-sm ring-1 ring-white/10 transition hover:bg-white/10"
                                        >
                                            Explore Courses
                                        </Link>
                                        <Link
                                            href="#"
                                            className="rounded-xl bg-white/5 px-4 py-2 text-sm ring-1 ring-white/10 transition hover:bg-white/10"
                                        >
                                            Student Portal
                                        </Link>
                                        <span className="ml-auto text-xs text-white/50">
                                            Built By Webina Digital ·  v2.0 2025
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Info grid */}
                <section className="relative z-10 pb-16">
                    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 lg:grid-cols-3">
                        {[
                            {
                                icon: (
                                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                                        <path
                                            d="M4 7h16M4 12h16M4 17h16"
                                            stroke="#0f0f10"
                                            strokeWidth="1.5"
                                        />
                                    </svg>
                                ),
                                title: "Admin Dashboard",
                                body:
                                    "Manage courses, students, and issue certificates with one clean interface.",
                                href: "/login",
                            },
                            {
                                icon: (
                                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                                        <path
                                            d="M12 2v20M2 12h20"
                                            stroke="#0f0f10"
                                            strokeWidth="1.5"
                                        />
                                    </svg>
                                ),
                                title: "Student Wallet",
                                body:
                                    "Students can view, download, and share their verified certificates.",
                                href: "#",
                            },
                            {
                                icon: (
                                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="9"
                                            stroke="#0f0f10"
                                            strokeWidth="1.5"
                                        />
                                        <path
                                            d="M8 12h8"
                                            stroke="#0f0f10"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                ),
                                title: "Public Verify",
                                body:
                                    "Anyone can confirm a certificate’s authenticity from the unique ID or QR.",
                                href: "#",
                            },
                        ].map((c) => (
                            <Link
                                key={c.title}
                                href={c.href}
                                className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
                            >
                                <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-[#FFE662] px-2.5 py-1 text-xs font-semibold text-black">
                                    {c.icon}
                                    <span>{c.title}</span>
                                </div>
                                <p className="text-white/80">{c.body}</p>
                                <div className="mt-4 text-sm text-[#FFE662] opacity-80 group-hover:opacity-100">
                                    Open →
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer className="relative z-10 border-t border-white/10 py-10 text-center text-sm text-white/60">
                    © {new Date().getFullYear()} Webina Digital LTD — All rights reserved.
                </footer>
            </div>
        </>
    );
}
