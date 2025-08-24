import React from "react";
import { useForm, router } from "@inertiajs/react";

export default function AttendanceIndex({ course, sessions }) {
    const { data, setData, post, reset } = useForm({ session_date: "", topic: "" });

    const createSession = (e) => {
        e.preventDefault();
        post(route("attendance.session.store", course.id), {
            onSuccess: () => reset(),
        });
    };

    const toggleStatus = (sessionId, attendanceId, current) => {
        const next = current === "present" ? "absent" : current === "absent" ? "late" : "present";
        router.patch(route("attendance.update", { session: sessionId, attendance: attendanceId }), { status: next });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-bold">Attendance — {course.title}</h1>

            <form onSubmit={createSession} className="flex gap-3 items-end">
                <input
                    type="date"
                    value={data.session_date}
                    onChange={(e) => setData("session_date", e.target.value)}
                    className="border rounded p-2"
                />
                <input
                    type="text"
                    placeholder="Topic (optional)"
                    value={data.topic}
                    onChange={(e) => setData("topic", e.target.value)}
                    className="border rounded p-2"
                />
                <button className="bg-black text-white px-4 py-2 rounded-xl">Add Session</button>
            </form>

            {sessions.map((s) => (
                <div key={s.id} className="border rounded-xl p-4 space-y-2">
                    <h2 className="font-semibold">
                        {s.session_date} — {s.topic ?? "No topic"}
                    </h2>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="border p-2">Student</th>
                                <th className="border p-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {s.attendance.map((a) => (
                                <tr key={a.id}>
                                    <td className="border p-2">{a.student.name}</td>
                                    <td
                                        onClick={() => toggleStatus(s.id, a.id, a.status)}
                                        className={`border p-2 cursor-pointer ${a.status === "present"
                                                ? "bg-green-100"
                                                : a.status === "late"
                                                    ? "bg-yellow-100"
                                                    : "bg-red-100"
                                            }`}
                                    >
                                        {a.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}
