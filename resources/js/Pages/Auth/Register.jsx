import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        registration_key: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation', 'registration_key'),
        });
    };

    return (
        <>
            <Head title="Admin Register — Webina" />
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

                {/* Register form */}
                <main className="relative z-10 flex min-h-[calc(100vh-100px)] items-center justify-center px-6">
                    <div className="w-full max-w-md">
                        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-md">
                            <h2 className="mb-6 text-center text-2xl font-bold">
                                Create Admin Account
                            </h2>

                            <form onSubmit={submit} className="space-y-5">
                                {/* Name */}
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-white/70"
                                    >
                                        Full Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[#FFE662]/50 focus:ring-0"
                                        autoComplete="name"
                                        required
                                    />
                                    {errors.name && (
                                        <div className="mt-1 text-sm text-red-400">
                                            {errors.name}
                                        </div>
                                    )}
                                </div>

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
                                        autoComplete="new-password"
                                        required
                                    />
                                    {errors.password && (
                                        <div className="mt-1 text-sm text-red-400">
                                            {errors.password}
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label
                                        htmlFor="password_confirmation"
                                        className="block text-sm font-medium text-white/70"
                                    >
                                        Confirm Password
                                    </label>
                                    <input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData("password_confirmation", e.target.value)}
                                        className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[#FFE662]/50 focus:ring-0"
                                        autoComplete="new-password"
                                        required
                                    />
                                    {errors.password_confirmation && (
                                        <div className="mt-1 text-sm text-red-400">
                                            {errors.password_confirmation}
                                        </div>
                                    )}
                                </div>

                                {/* Registration Key */}
                                <div>
                                    <label
                                        htmlFor="registration_key"
                                        className="block text-sm font-medium text-white/70"
                                    >
                                        Registration Key
                                    </label>
                                    <input
                                        id="registration_key"
                                        type="text"
                                        value={data.registration_key}
                                        onChange={(e) => setData("registration_key", e.target.value)}
                                        className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[#FFE662]/50 focus:ring-0"
                                        placeholder="Enter the registration key"
                                        required
                                    />
                                    {errors.registration_key && (
                                        <div className="mt-1 text-sm text-red-400">
                                            {errors.registration_key}
                                        </div>
                                    )}
                                    <p className="mt-1 text-xs text-white/50">
                                        This key is required to create an admin account
                                    </p>
                                </div>

                                {/* Login link */}
                                <div className="text-center text-sm">
                                    Already have an account?{' '}
                                    <Link
                                        href={route("login")}
                                        className="text-[#FFE662] hover:underline"
                                    >
                                        Sign in
                                    </Link>
                                </div>

                                {/* Submit button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full rounded-xl bg-[#FFE662] py-3 font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {processing ? "Creating account..." : "Create Account"}
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
