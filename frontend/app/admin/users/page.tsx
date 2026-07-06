"use client";

import { useEffect, useState } from "react";
import { handleGetAllUsers } from "@/lib/actions/admin-action";

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            const result = await handleGetAllUsers();
            if (result.success) {
                setUsers(result.data.users);
            } else {
                setError(result.message || "Failed to load users.");
            }
            setLoading(false);
        };
        load();
    }, []);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-navy-800">Users</h1>
                <p className="mt-1 text-sm text-navy-400">{users.length} total</p>
            </div>

            {error && (
                <p className="mb-4 rounded-lg border border-danger/30 bg-danger/5 px-4 py-2.5 text-sm text-danger">
                    {error}
                </p>
            )}

            <div className="overflow-hidden rounded-xl border border-border bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-navy-300">
                            <th className="px-4 py-3 font-semibold">Name</th>
                            <th className="px-4 py-3 font-semibold">Email</th>
                            <th className="px-4 py-3 font-semibold">Role</th>
                            <th className="px-4 py-3 font-semibold">Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-10 text-center text-navy-400">Loading…</td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-10 text-center text-navy-400">No users found.</td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="border-b border-border last:border-0">
                                    <td className="px-4 py-3 font-medium text-navy-800">{user.name}</td>
                                    <td className="px-4 py-3 text-navy-600">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                user.role === "ADMIN"
                                                    ? "bg-gold-100 text-gold-700"
                                                    : "bg-navy-50 text-navy-600"
                                            }`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-navy-600">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
