"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, KeyRound } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import {
    handleGetPasswordStatus,
    handleChangePassword,
} from "@/lib/actions/profile-action";
import PasswordStrengthMeter, {
    MINIMUM_SCORE,
    scorePassword,
} from "@/app/_components/PasswordStrengthMeter";

const inputClass =
    "w-full rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none";

export default function ChangePassword() {
    const toast = useToast();
    const { user } = useAuth();

    const [status, setStatus] = useState<any>(null);
    const [open, setOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [busy, setBusy] = useState(false);

    const load = async () => {
        const result = await handleGetPasswordStatus();
        if (result.success) setStatus(result.data);
    };

    useEffect(() => {
        load();
    }, []);

    const userInputs = useMemo(
        () => [user?.email ?? "", user?.name ?? "", "trailwear"],
        [user?.email, user?.name]
    );
    const score = useMemo(
        () => scorePassword(newPassword, userInputs)?.score ?? 0,
        [newPassword, userInputs]
    );

    const reset = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentPassword || !newPassword) {
            toast.error("Missing details", "Fill in both password fields.");
            return;
        }
        if (score < MINIMUM_SCORE) {
            toast.error("Password too weak", "Choose a longer or less predictable password.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match", "Re-enter the same new password.");
            return;
        }

        setBusy(true);
        const result = await handleChangePassword(currentPassword, newPassword);
        setBusy(false);

        if (result.success) {
            reset();
            setOpen(false);
            load();
            toast.success("Password updated", "Other devices have been signed out.");
        } else {
            toast.error("Could not change password", result.message || "Please try again.");
        }
    };

    const expired = status?.expired === true;
    const daysLeft = status?.daysUntilExpiry ?? 0;
    const expiringSoon = !expired && daysLeft <= 14;

    if (status && status.hasPassword === false) {
        return (
            <section className="rounded-xl border border-border bg-white p-5">
                <h2 className="flex items-center gap-2 text-base font-semibold text-navy-800">
                    <KeyRound className="h-4 w-4" />
                    Password
                </h2>
                <p className="mt-1 text-sm text-navy-400">
                    You sign in with Google, so this account has no TrailWear password to change.
                </p>
            </section>
        );
    }

    return (
        <section className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="flex items-center gap-2 text-base font-semibold text-navy-800">
                        <KeyRound className="h-4 w-4" />
                        Password
                    </h2>
                    <p className="mt-1 text-sm text-navy-400">
                        {expired
                            ? "Your password has expired."
                            : status
                                ? `Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`
                                : "Change your account password."}
                    </p>
                </div>
                {!open && (
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="shrink-0 rounded-full bg-navy-600 px-4 py-2 text-sm font-medium text-white hover:bg-navy-700"
                    >
                        Change
                    </button>
                )}
            </div>

            {(expired || expiringSoon) && (
                <p
                    className={`mt-3 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${
                        expired
                            ? "border-danger/30 bg-danger/5 text-danger"
                            : "border-gold-300 bg-gold-50 text-gold-800"
                    }`}
                >
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {expired
                        ? "You must set a new password before you can keep shopping."
                        : `Your password expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}. Consider changing it now.`}
                </p>
            )}

            {open && (
                <form onSubmit={onSubmit} className="mt-4 space-y-3 border-t border-border pt-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-navy-400">
                            Current password
                        </label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            autoComplete="current-password"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-navy-400">
                            New password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            autoComplete="new-password"
                            className={inputClass}
                        />
                        <PasswordStrengthMeter password={newPassword} userInputs={userInputs} />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-navy-400">
                            Confirm new password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                            className={inputClass}
                        />
                    </div>

                    <p className="text-xs text-navy-300">
                        You can&apos;t reuse any of your last 5 passwords. Changing it signs you out
                        on other devices.
                    </p>

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={busy}
                            className="rounded-full bg-navy-600 px-5 py-2 text-sm font-medium text-white hover:bg-navy-700 disabled:opacity-60"
                        >
                            {busy ? "Updating…" : "Update password"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                reset();
                            }}
                            className="text-sm font-medium text-navy-400 hover:text-navy-700"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </section>
    );
}
