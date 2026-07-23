"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { handleGetAuditLogs } from "@/lib/actions/admin-action";

interface AuditUser {
    id: string;
    email: string;
    name: string;
}

interface AuditEntry {
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    ip: string | null;
    metadata: unknown;
    createdAt: string;
    user: AuditUser | null;
}

// Actions the backend can record (see audit.service AuditAction). Kept here so
// the filter dropdown stays useful even when a page of results is empty.
const ACTIONS = [
    "CREATE", "UPDATE", "DELETE",
    "REGISTER", "LOGIN", "LOGIN_FAILED", "LOGIN_LOCKED", "LOGOUT",
    "LOGIN_UNVERIFIED", "ACCOUNT_RECLAIMED",
    "PASSWORD_CHANGED", "PASSWORD_RESET_REQUESTED", "PASSWORD_RESET",
    "EMAIL_VERIFIED",
    "GOOGLE_LOGIN", "GOOGLE_REGISTER", "GOOGLE_LOGIN_FAILED",
    "MFA_ENABLED", "MFA_DISABLED", "MFA_FAILED", "MFA_BACKUP_USED",
    "ORDER_PLACED", "ORDER_CANCELLED",
    "PROFILE_UPDATED", "CAPTCHA_FAILED",
];

const DANGER_ACTIONS = new Set([
    "LOGIN_FAILED", "LOGIN_LOCKED", "MFA_FAILED", "CAPTCHA_FAILED",
    "GOOGLE_LOGIN_FAILED", "LOGIN_UNVERIFIED",
]);
const WARN_ACTIONS = new Set([
    "DELETE", "ORDER_CANCELLED", "MFA_DISABLED", "ACCOUNT_RECLAIMED",
    "PASSWORD_RESET_REQUESTED",
]);

function actionClass(action: string) {
    if (DANGER_ACTIONS.has(action)) return "bg-danger/10 text-danger";
    if (WARN_ACTIONS.has(action)) return "bg-gold-100 text-gold-700";
    return "bg-navy-50 text-navy-600";
}

function metaPreview(metadata: unknown) {
    if (metadata === null || metadata === undefined) return "";
    if (typeof metadata === "object" && Object.keys(metadata as object).length === 0) return "";
    return JSON.stringify(metadata);
}

export default function AdminAudit() {
    const [entries, setEntries] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [action, setAction] = useState("");
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        const result = await handleGetAuditLogs({
            page,
            action: action || undefined,
            search: search || undefined,
        });
        if (result.success) {
            setEntries(result.data.items);
            setTotal(result.data.total);
            setTotalPages(result.data.totalPages);
            setError("");
        } else {
            setError(result.message || "Failed to load audit logs.");
        }
        setLoading(false);
    }, [page, action, search]);

    useEffect(() => {
        load();
    }, [load]);

    const onSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-navy-800">Audit log</h1>
                <p className="mt-1 text-sm text-navy-400">
                    {total} event{total === 1 ? "" : "s"} recorded
                </p>
            </div>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <form onSubmit={onSearchSubmit} className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search by email, IP, or entity ID…"
                        className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-3.5 text-sm text-navy-800 placeholder:text-navy-300 transition focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-100"
                    />
                </form>

                <select
                    value={action}
                    onChange={(e) => {
                        setPage(1);
                        setAction(e.target.value);
                    }}
                    className="rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-navy-800 transition focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-100"
                >
                    <option value="">All actions</option>
                    {ACTIONS.map((a) => (
                        <option key={a} value={a}>{a}</option>
                    ))}
                </select>
            </div>

            {error && (
                <p className="mb-4 rounded-lg border border-danger/30 bg-danger/5 px-4 py-2.5 text-sm text-danger">
                    {error}
                </p>
            )}

            <div className="overflow-x-auto rounded-xl border border-border bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-navy-300">
                            <th className="px-4 py-3 font-semibold">Time</th>
                            <th className="px-4 py-3 font-semibold">Action</th>
                            <th className="px-4 py-3 font-semibold">Entity</th>
                            <th className="px-4 py-3 font-semibold">User</th>
                            <th className="px-4 py-3 font-semibold">IP</th>
                            <th className="px-4 py-3 font-semibold">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-10 text-center text-navy-400">Loading…</td>
                            </tr>
                        ) : entries.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-10 text-center text-navy-400">No events found.</td>
                            </tr>
                        ) : (
                            entries.map((entry) => {
                                const meta = metaPreview(entry.metadata);
                                return (
                                    <tr key={entry.id} className="border-b border-border last:border-0 align-top">
                                        <td className="whitespace-nowrap px-4 py-3 text-navy-600">
                                            {new Date(entry.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${actionClass(entry.action)}`}>
                                                {entry.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-navy-600">
                                            <span className="font-medium text-navy-800">{entry.entity}</span>
                                            {entry.entityId && (
                                                <span className="block font-mono text-xs text-navy-300" title={entry.entityId}>
                                                    {entry.entityId.length > 12 ? `${entry.entityId.slice(0, 12)}…` : entry.entityId}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-navy-600">
                                            {entry.user ? (
                                                <>
                                                    <span className="block text-navy-800">{entry.user.name}</span>
                                                    <span className="block text-xs text-navy-400">{entry.user.email}</span>
                                                </>
                                            ) : (
                                                <span className="text-navy-300">—</span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-navy-500">
                                            {entry.ip || "—"}
                                        </td>
                                        <td className="max-w-xs px-4 py-3">
                                            {meta ? (
                                                <code className="block truncate font-mono text-xs text-navy-500" title={meta}>
                                                    {meta}
                                                </code>
                                            ) : (
                                                <span className="text-navy-300">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-navy-400">
                    Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1 || loading}
                        className="flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-navy-600 transition hover:bg-navy-50 disabled:opacity-40"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Prev
                    </button>
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages || loading}
                        className="flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-navy-600 transition hover:bg-navy-50 disabled:opacity-40"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
