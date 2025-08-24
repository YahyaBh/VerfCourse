// resources/js/Pages/Errors/404.jsx
import React from "react";
import { Head, Link } from "@inertiajs/react";

export default function NotFound() {



    const locationBack = () => {
        window.history.back();
    }

    return (
        <>
            <Head title="404 - Page Not Found" />
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-6">
                <h1 className="text-9xl font-extrabold text-gray-800 tracking-widest">404</h1>

                {/* <div className="bg-[#FFE662] px-4 text-sm rounded rotate-12 absolute">
                    Page Not Found
                </div> */}

                <p className="text-gray-600 mt-6 text-lg">
                    Oops! The page you are looking for doesn’t exist or has been moved.
                </p>

                <div className="mt-8">
                    <Link
                        // go back one page
                        onClick={() => locationBack()}
                        className="px-6 py-3 bg-[#FFE662] rounded-2xl shadow-lg font-semibold text-gray-800 transition hover:shadow-xl hover:bg-yellow-300"
                    >
                        Go Back Home
                    </Link>
                </div>
            </div>
        </>
    );
}
