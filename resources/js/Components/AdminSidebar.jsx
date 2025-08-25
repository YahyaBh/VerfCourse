import React from "react";
import { Link, usePage } from "@inertiajs/react";

const AdminSidebar = ({ activeItem }) => {
    const { auth } = usePage().props;

    const navItems = [
        {
            label: "Dashboard",
            href: "/admin/dashboard",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h1v11h1m-2 0V10h-1m0 0a2 2 0 012-2h14a2 2 0 012 2v0m-16 0h-1m16 0h1m-1 0V10" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 3v1m0 0H3v1m18-1v1m-18 0H3" />
                </svg>
            )
        },
        {
            label: "Certificates",
            href: "/admin/certificates",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <path d="M8 9h8" />
                    <path d="M8 13h5" />
                </svg>
            )
        },
        {
            label: "Students",
            href: "/admin/students",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
            )
        },
        {
            label: "Courses",
            href: "/admin/courses",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            )
        },
        {
            label: "Attendance",
            href: "/admin/attendance",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="XXXXXXXXXXXXXXXXXXXXXXXXXX">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            label : "Payments",
            href: "/admin/payments",
            icon: (
                ""
            )
        }
    ];

    return (
        <aside className="bg-gradient-to-b from-gray-800 to-black text-white w-60 min-h-screen flex flex flex-col justify-between py-6">
            <div className="px-6">
                {/* Logo / Brand */}
                <div className="flex items-center mb-8">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-white font-bold text-xl">
                        W
                    </div>
                    <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                        WEBINA
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center justify-between px-4 py-3 rounded-lg ${activeItem === item.label
                                ? "bg-gray-800/50 text-white"
                                : "text-gray-400 hover:bg-gray-800/30 hover:text-white"
                                } transition-colors`}
                        >
                            <div className="flex items-center space-x-3">
                                <span className="text-yellow-500">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </div>
                        </Link>
                    ))}
                </nav>
            </div>

            {/* User profile section */}
            <div className="px-6 mt-auto">
                <div className="flex items-center space-x-3 p-4 bg-gray-800/30 rounded-xl">
                    {/* User avatar with gradient background */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-white font-bold">
                        {auth.user.name ? auth.user.name.charAt(0) : 'U'}
                    </div>
                    <div>
                        {/* User name and email */}
                        <div className="text-sm font-bold text-white">{auth.user.name}</div>
                        <div className="text-xs text-gray-400">{auth.user.email}</div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;
