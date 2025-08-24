import React from "react";
import { Link, usePage } from "@inertiajs/react";

const navItems = [
    {
        label: "Dashboard", href: "/admin/dashboard", icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h1v11h1m-2 0V10h-1m0 0a2 2 0 012-2h14a2 2 0 012 2v0m-16 0h-1m16 0h1m-1 0v11m1 0h-1m1 0V10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 3v1m0 0H3v1m18-1v1m-18 0H3" />
            </svg>
        )
    },
    {
        label: "Certificates", href: "/admin/certificates", icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="M8 9h8" />
                <path d="M8 13h5" />
            </svg>
        )
    },
    {
        label: "Students", href: "/admin/students", icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
        )
    },
    {
        label: "Courses", href: "/admin/courses", icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        )
    }

    // {
    //     label: "Stats", href: "/admin/stats", icon: (
    //         <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    //             <path d="M4 13v5h16v-8l-8 5-8-5v3z" />
    //             <path d="M4 5l8 5 8-5" />
    //         </svg>
    //     )
    // },
    // {
    //     label: "Notifications", href: "/admin/notifications", icon: (
    //         <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    //             <path d="M18 8a6 6 0 00-12 0c0 7-2 9-2 9h16s-2-2-2-9z" />
    //             <path d="M13.73 21a2 2 0 01-3.46 0" />
    //         </svg>
    //     ), badge: 2
    // }, // example count
    // {
    //     label: "Chat", href: "/admin/chat", icon: (
    //         <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    //             <path d="M8 21h8m2 0h-8m-8 0h4" />
    //             <path d="M15 19h2a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2h2l2 2 2-2h2z" />
    //         </svg>
    //     )
    // },
];

const AdminSidebar = ({ activeItem }) => {
    const { auth } = usePage().props;

    return (
        <aside className="bg-[#1e1e1e] text-white w-60 min-h-screen flex flex-col justify-between py-6">
            <div>
                {/* Logo / Brand */}
                <div className="flex items-center px-6 mb-8">
                    <svg className="w-8 h-8 text-[#FFE662]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M12 3L3 7l9 4 9-4-9-4zm0 6L3 13l9 4 9-4-9-4z" />
                        <path d="M12 13v8" />
                    </svg>
                    <span className="ml-3 text-xl font-bold text-[#FFE662]">Webina Admin</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center justify-between px-4 py-2 rounded-lg ${activeItem === item.label ? "bg-[#3a3a3a]" : "hover:bg-[#3a3a3a]"
                                } transition-colors`}
                        >
                            <div className="flex items-center space-x-3">
                                <span className="text-[#FFE662]">{item.icon}</span>
                                <span className="text-sm font-medium">{item.label}</span>
                            </div>
                            {item.badge && (
                                <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* User profile section */}
            <div className="px-6 mt-6">
                <div className="flex items-center space-x-3">
                    {/* Placeholder avatar; replace with real avatar if available */}
                    <div className="w-10 h-10 rounded-full bg-gray-500"></div>
                    <div>
                        {/* get the name and email from inertia auth */}
                        <div className="text-sm font-bold">{auth.user.name}</div>
                        <div className="text-xs text-gray-400">{auth.user.email}</div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;
