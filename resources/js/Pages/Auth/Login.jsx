import { useForm, Head, Link } from "@inertiajs/react";
import React from "react";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <>
            <Head title="Admin Login — Webina" />
            <div className="relative min-h-screen bg-[#0f0f10] text-white">
                {/* Background gradient like Welcome page */}
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
                                Webina Certificates — Admin
                            </div>
                        </div>
                        <nav className="flex items-center gap-3 text-sm">
                            <Link
                                href="/"
                                className="rounded-lg px-3 py-2 text-white/80 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-white"
                            >
                                Back to Home
                            </Link>
                        </nav>
                    </div>
                </header>

                {/* Login form */}
                <main className="relative z-10 flex min-h-[calc(100vh-100px)] items-center justify-center px-6">
                    <div className="w-full max-w-md">
                        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-md">
                            <h2 className="mb-6 text-center text-2xl font-bold">
                                Webina Administration
                            </h2>

                            {status && (
                                <div className="mb-4 text-sm font-medium text-green-400">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-5">
                                {/* Email */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-white/70"
                                    >
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                        className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[#FFE662]/50 focus:ring-0"
                                        autoComplete="username"
                                        required
                                    />
                                    {errors.email && (
                                        <div className="mt-1 text-sm text-red-400">
                                            {errors.email}
                                        </div>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-white/70"
                                    >
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData("password", e.target.value)}
                                        className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[#FFE662]/50 focus:ring-0"
                                        autoComplete="current-password"
                                        required
                                    />
                                    {errors.password && (
                                        <div className="mt-1 text-sm text-red-400">
                                            {errors.password}
                                        </div>
                                    )}
                                </div>

                                {/* Remember me + Forgot password */}
                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="remember"
                                            checked={data.remember}
                                            onChange={(e) =>
                                                setData("remember", e.target.checked)
                                            }
                                            className="rounded border-white/20 bg-white/5 text-[#FFE662] focus:ring-[#FFE662]"
                                        />
                                        <span className="text-white/70">Remember me</span>
                                    </label>
                                    {canResetPassword && (
                                        <Link
                                            href={route("password.request")}
                                            className="text-[#FFE662] hover:underline"
                                        >
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>

                                {/* Submit button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full rounded-xl bg-[#FFE662] py-3 font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {processing ? "Logging in..." : "Log in"}
                                </button>
                            </form>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="relative z-10 border-t border-white/10 py-6 text-center text-xs text-white/60">
                    © {new Date().getFullYear()} Webina Digital LTD — Secure Admin Access
                </footer>
            </div>
        </>
    );
}
