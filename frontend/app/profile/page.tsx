"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Calendar,
    Check,
    ChevronRight,
    Heart,
    LogOut,
    Mail,
    MapPin,
    Package,
    Pencil,
    Plus,
    Shield,
    X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import MfaSettings from "@/app/_components/MfaSettings";
import ChangePassword from "@/app/_components/ChangePassword";
import {
    handleGetProfile,
    handleUpdateProfile,
    handleGetAddresses,
    handleAddAddress,
} from "@/lib/actions/profile-action";

const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

export default function ProfilePage() {
    const { user, loading: authLoading, logout, refreshUser } = useAuth();
    const toast = useToast();
    const router = useRouter();

    const [profile, setProfile] = useState<any>(null);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState("");
    const [savingName, setSavingName] = useState(false);

    const [showAddForm, setShowAddForm] = useState(false);
    const [line1, setLine1] = useState("");
    const [line2, setLine2] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("Nepal");
    const [zip, setZip] = useState("");
    const [savingAddress, setSavingAddress] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace("/login");
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            setLoading(true);
            const [profileResult, addressResult] = await Promise.all([
                handleGetProfile(),
                handleGetAddresses(),
            ]);
            if (profileResult.success) {
                setProfile(profileResult.data.user);
            }
            if (addressResult.success) {
                setAddresses(addressResult.data.addresses);
            }
            setLoading(false);
        };
        load();
    }, [user]);

    const onStartEditName = () => {
        setNameInput(profile?.name || "");
        setEditingName(true);
    };

    const onSaveName = async () => {
        if (!nameInput.trim()) {
            toast.error("Name required", "Please enter your name.");
            return;
        }

        setSavingName(true);
        const result = await handleUpdateProfile({ name: nameInput.trim() });
        setSavingName(false);

        if (result.success) {
            setProfile(result.data.user);
            setEditingName(false);
            await refreshUser();
            toast.success("Profile updated", "Your name has been saved.");
        } else {
            toast.error("Could not update", result.message || "Please try again.");
        }
    };

    const onAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!line1.trim() || !city.trim() || !country.trim() || !zip.trim()) {
            toast.error("Missing details", "Please fill in all required address fields.");
            return;
        }

        setSavingAddress(true);
        const result = await handleAddAddress({
            line1: line1.trim(),
            line2: line2.trim() || undefined,
            city: city.trim(),
            country: country.trim(),
            zip: zip.trim(),
        });
        setSavingAddress(false);

        if (result.success) {
            setAddresses((prev) => [...prev, result.data.address]);
            setShowAddForm(false);
            setLine1("");
            setLine2("");
            setCity("");
            setZip("");
            toast.success("Address saved", "Your delivery address has been added.");
        } else {
            toast.error("Could not save address", result.message || "Please try again.");
        }
    };

    const onLogout = async () => {
        const result = await logout();
        if (result.success) {
            toast.success("Logged out", "See you on the next trail.");
            router.push("/");
        } else {
            toast.error("Logout failed", result.message || "Please try again.");
        }
    };

    if (authLoading || !user || loading || !profile) {
        return (
            <main className="flex flex-1 items-center justify-center py-24">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy-200 border-t-navy-600" />
            </main>
        );
    }

    const initial = (profile.name || profile.email || "?").charAt(0).toUpperCase();
    const isAdmin = profile.role === "ADMIN";

    const inputClass =
        "w-full rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none";

    return (
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
            <h1 className="text-2xl font-bold text-navy-800">My account</h1>
            <p className="mt-1 text-sm text-navy-400">
                Manage your details and delivery addresses.
            </p>

            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_300px]">
                <div className="space-y-6">
                    <section className="rounded-xl border border-border bg-white p-5">
                        <h2 className="text-base font-semibold text-navy-800">
                            Personal information
                        </h2>

                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="text-xs font-medium text-navy-400">Full name</label>
                                {editingName ? (
                                    <div className="mt-1.5 flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={nameInput}
                                            onChange={(e) => setNameInput(e.target.value)}
                                            className={inputClass}
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={onSaveName}
                                            disabled={savingName}
                                            aria-label="Save name"
                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-600 text-white hover:bg-navy-700 disabled:opacity-60"
                                        >
                                            <Check className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingName(false)}
                                            disabled={savingName}
                                            aria-label="Cancel"
                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-navy-400 hover:text-navy-700 disabled:opacity-60"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-1.5 flex items-center justify-between gap-3">
                                        <span className="text-sm text-navy-800">{profile.name}</span>
                                        <button
                                            type="button"
                                            onClick={onStartEditName}
                                            className="flex items-center gap-1.5 text-xs font-medium text-navy-500 hover:text-navy-800"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                            Edit
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-border pt-4">
                                <label className="text-xs font-medium text-navy-400">
                                    Email address
                                </label>
                                <div className="mt-1.5 flex items-center gap-2 text-sm text-navy-800">
                                    <Mail className="h-4 w-4 text-navy-300" />
                                    {profile.email}
                                </div>
                            </div>
                        </div>
                    </section>

                    <ChangePassword />

                    <MfaSettings />

                    <section className="rounded-xl border border-border bg-white p-5">
                        <div className="flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-base font-semibold text-navy-800">
                                <MapPin className="h-4 w-4" />
                                Saved addresses
                            </h2>
                            {!showAddForm && (
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(true)}
                                    className="flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:text-navy-800"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add
                                </button>
                            )}
                        </div>

                        {addresses.length > 0 ? (
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                {addresses.map((address) => (
                                    <div
                                        key={address.id}
                                        className="rounded-lg border border-border p-3.5 text-sm text-navy-600"
                                    >
                                        <p className="font-medium text-navy-800">{address.line1}</p>
                                        {address.line2 && <p>{address.line2}</p>}
                                        <p>
                                            {address.city}, {address.country} {address.zip}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            !showAddForm && (
                                <p className="mt-4 text-sm text-navy-400">
                                    You haven&apos;t saved any addresses yet.
                                </p>
                            )
                        )}

                        {showAddForm && (
                            <form
                                onSubmit={onAddAddress}
                                className="mt-4 space-y-3 border-t border-border pt-4"
                            >
                                <input
                                    type="text"
                                    value={line1}
                                    onChange={(e) => setLine1(e.target.value)}
                                    placeholder="Address line 1"
                                    className={inputClass}
                                />
                                <input
                                    type="text"
                                    value={line2}
                                    onChange={(e) => setLine2(e.target.value)}
                                    placeholder="Address line 2 (optional)"
                                    className={inputClass}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="City"
                                        className={inputClass}
                                    />
                                    <input
                                        type="text"
                                        value={zip}
                                        onChange={(e) => setZip(e.target.value)}
                                        placeholder="ZIP / Postal code"
                                        className={inputClass}
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    placeholder="Country"
                                    className={inputClass}
                                />
                                <div className="flex items-center gap-3">
                                    <button
                                        type="submit"
                                        disabled={savingAddress}
                                        className="rounded-full bg-navy-600 px-5 py-2 text-sm font-medium text-white hover:bg-navy-700 disabled:opacity-60"
                                    >
                                        {savingAddress ? "Saving…" : "Save address"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="text-sm font-medium text-navy-400 hover:text-navy-700"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>
                </div>

                <aside className="space-y-6">
                    <div className="rounded-xl border border-border bg-white p-5 text-center">
                        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-navy-600 text-2xl font-semibold text-white">
                            {initial}
                        </span>
                        <p className="mt-3 font-semibold text-navy-800">{profile.name}</p>
                        <p className="text-sm text-navy-400">{profile.email}</p>

                        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                            <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                                    isAdmin
                                        ? "bg-gold-100 text-gold-700"
                                        : "bg-navy-50 text-navy-600"
                                }`}
                            >
                                <Shield className="h-3 w-3" />
                                {isAdmin ? "Admin" : "Customer"}
                            </span>
                        </div>

                        {profile.createdAt && (
                            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-navy-300">
                                <Calendar className="h-3.5 w-3.5" />
                                Member since {formatDate(profile.createdAt)}
                            </p>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-xl border border-border bg-white">
                        <Link
                            href="/orders"
                            className="flex items-center gap-3 border-b border-border px-5 py-3.5 text-sm font-medium text-navy-700 hover:bg-navy-50"
                        >
                            <Package className="h-4 w-4 text-navy-400" />
                            My orders
                            <ChevronRight className="ml-auto h-4 w-4 text-navy-300" />
                        </Link>
                        <Link
                            href="/wishlist"
                            className="flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-navy-700 hover:bg-navy-50"
                        >
                            <Heart className="h-4 w-4 text-navy-400" />
                            My wishlist
                            <ChevronRight className="ml-auto h-4 w-4 text-navy-300" />
                        </Link>
                    </div>

                    <button
                        type="button"
                        onClick={onLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 py-3 text-sm font-medium text-danger hover:bg-danger/5"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign out
                    </button>
                </aside>
            </div>
        </main>
    );
}
