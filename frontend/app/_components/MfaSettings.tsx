"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, Copy, ShieldCheck, ShieldOff, X } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import {
    handleGetMfaStatus,
    handleSetupMfa,
    handleEnableMfa,
    handleDisableMfa,
} from "@/lib/actions/mfa-action";

const inputClass =
    "w-full rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none";

export default function MfaSettings() {
    const toast = useToast();

    const [loading, setLoading] = useState(true);
    const [enabled, setEnabled] = useState(false);
    const [backupCodesLeft, setBackupCodesLeft] = useState(0);

    // Enrolment
    const [qrCode, setQrCode] = useState("");
    const [secret, setSecret] = useState("");
    const [enableCode, setEnableCode] = useState("");
    const [busy, setBusy] = useState(false);
    const [backupCodes, setBackupCodes] = useState<string[]>([]);

    // Disabling
    const [showDisable, setShowDisable] = useState(false);
    const [disablePassword, setDisablePassword] = useState("");
    const [disableCode, setDisableCode] = useState("");

    const load = async () => {
        const result = await handleGetMfaStatus();
        if (result.success) {
            setEnabled(result.data.enabled);
            setBackupCodesLeft(result.data.backupCodesLeft);
        }
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const onStartSetup = async () => {
        setBusy(true);
        const result = await handleSetupMfa();
        setBusy(false);

        if (result.success) {
            setQrCode(result.data.qrCode);
            setSecret(result.data.secret);
        } else {
            toast.error("Could not start setup", result.message || "Please try again.");
        }
    };

    const onEnable = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        const result = await handleEnableMfa(enableCode.trim());
        setBusy(false);

        if (result.success) {
            setBackupCodes(result.data.backupCodes);
            setQrCode("");
            setSecret("");
            setEnableCode("");
            setEnabled(true);
            setBackupCodesLeft(result.data.backupCodes.length);
            toast.success("Two-factor enabled", "Your account now needs a code to sign in.");
        } else {
            toast.error("Could not enable", result.message || "Please try again.");
        }
    };

    const onDisable = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        const result = await handleDisableMfa(disablePassword, disableCode.trim());
        setBusy(false);

        if (result.success) {
            setEnabled(false);
            setShowDisable(false);
            setDisablePassword("");
            setDisableCode("");
            setBackupCodesLeft(0);
            toast.success("Two-factor disabled", "Your account no longer requires a code.");
        } else {
            toast.error("Could not disable", result.message || "Please try again.");
        }
    };

    const copyBackupCodes = () => {
        navigator.clipboard.writeText(backupCodes.join("\n"));
        toast.success("Copied", "Backup codes copied to your clipboard.");
    };

    const onCancelSetup = () => {
        setQrCode("");
        setSecret("");
        setEnableCode("");
    };

    if (loading) {
        return (
            <section className="rounded-xl border border-border bg-white p-5">
                <div className="h-5 w-40 animate-pulse rounded bg-navy-50" />
            </section>
        );
    }

    return (
        <section className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="flex items-center gap-2 text-base font-semibold text-navy-800">
                        <ShieldCheck className="h-4 w-4" />
                        Two-factor authentication
                    </h2>
                    <p className="mt-1 text-sm text-navy-400">
                        Require a code from your authenticator app when signing in.
                    </p>
                </div>
                <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        enabled ? "bg-success/10 text-success" : "bg-navy-50 text-navy-500"
                    }`}
                >
                    {enabled ? "On" : "Off"}
                </span>
            </div>

            {/* One-time display of backup codes, right after enabling */}
            {backupCodes.length > 0 && (
                <div className="mt-4 rounded-lg border border-gold-300 bg-gold-50 p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold text-gold-800">
                        <AlertTriangle className="h-4 w-4" />
                        Save your backup codes now
                    </p>
                    <p className="mt-1 text-xs text-gold-700">
                        Each code works once, and they will not be shown again. Use them if you lose
                        access to your authenticator app.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {backupCodes.map((code) => (
                            <code
                                key={code}
                                className="rounded border border-gold-200 bg-white px-2 py-1.5 text-center font-mono text-sm text-navy-800"
                            >
                                {code}
                            </code>
                        ))}
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={copyBackupCodes}
                            className="flex items-center gap-1.5 rounded-full bg-navy-600 px-4 py-2 text-xs font-semibold text-white hover:bg-navy-700"
                        >
                            <Copy className="h-3.5 w-3.5" />
                            Copy codes
                        </button>
                        <button
                            type="button"
                            onClick={() => setBackupCodes([])}
                            className="text-xs font-medium text-gold-700 hover:text-gold-900"
                        >
                            I&apos;ve saved them
                        </button>
                    </div>
                </div>
            )}

            {/* Enabled state */}
            {enabled && backupCodes.length === 0 && (
                <div className="mt-4">
                    <p className="text-sm text-navy-500">
                        {backupCodesLeft} backup code{backupCodesLeft === 1 ? "" : "s"} remaining.
                    </p>

                    {showDisable ? (
                        <form onSubmit={onDisable} className="mt-4 space-y-3 border-t border-border pt-4">
                            <p className="text-sm text-navy-600">
                                Confirm your password and a current code to turn this off.
                            </p>
                            <input
                                type="password"
                                value={disablePassword}
                                onChange={(e) => setDisablePassword(e.target.value)}
                                placeholder="Your password"
                                autoComplete="current-password"
                                className={inputClass}
                            />
                            <input
                                type="text"
                                value={disableCode}
                                onChange={(e) => setDisableCode(e.target.value)}
                                placeholder="6-digit code"
                                inputMode="numeric"
                                maxLength={6}
                                className={`${inputClass} font-mono`}
                            />
                            <div className="flex items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={busy}
                                    className="flex items-center gap-1.5 rounded-full bg-danger px-5 py-2 text-sm font-medium text-white hover:bg-danger/90 disabled:opacity-60"
                                >
                                    <ShieldOff className="h-4 w-4" />
                                    {busy ? "Disabling…" : "Turn off"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDisable(false)}
                                    className="text-sm font-medium text-navy-400 hover:text-navy-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowDisable(true)}
                            className="mt-3 text-sm font-medium text-danger hover:underline"
                        >
                            Turn off two-factor authentication
                        </button>
                    )}
                </div>
            )}

            {/* Disabled: start enrolment */}
            {!enabled && !qrCode && (
                <button
                    type="button"
                    onClick={onStartSetup}
                    disabled={busy}
                    className="mt-4 rounded-full bg-navy-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-navy-700 disabled:opacity-60"
                >
                    {busy ? "Preparing…" : "Set up two-factor"}
                </button>
            )}

            {/* Enrolment: scan + confirm */}
            {!enabled && qrCode && (
                <form onSubmit={onEnable} className="mt-4 space-y-4 border-t border-border pt-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <img
                            src={qrCode}
                            alt="QR code for authenticator app"
                            className="h-40 w-40 shrink-0 rounded-lg border border-border"
                        />
                        <div className="min-w-0 flex-1 text-sm text-navy-600">
                            <p className="font-medium text-navy-800">1. Scan this code</p>
                            <p className="mt-0.5 text-navy-400">
                                Use Google Authenticator, Authy, or any TOTP app.
                            </p>
                            <p className="mt-3 font-medium text-navy-800">Can&apos;t scan it?</p>
                            <p className="mt-0.5 text-navy-400">Enter this key manually:</p>
                            <code className="mt-1 block break-all rounded border border-border bg-navy-50 px-2 py-1.5 font-mono text-xs text-navy-700">
                                {secret}
                            </code>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-navy-800">
                            2. Enter the 6-digit code to confirm
                        </label>
                        <input
                            type="text"
                            value={enableCode}
                            onChange={(e) => setEnableCode(e.target.value)}
                            placeholder="123456"
                            inputMode="numeric"
                            maxLength={6}
                            className={`${inputClass} font-mono tracking-widest`}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={busy}
                            className="flex items-center gap-1.5 rounded-full bg-navy-600 px-5 py-2 text-sm font-medium text-white hover:bg-navy-700 disabled:opacity-60"
                        >
                            <Check className="h-4 w-4" />
                            {busy ? "Verifying…" : "Verify and enable"}
                        </button>
                        <button
                            type="button"
                            onClick={onCancelSetup}
                            className="flex items-center gap-1 text-sm font-medium text-navy-400 hover:text-navy-700"
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </section>
    );
}
