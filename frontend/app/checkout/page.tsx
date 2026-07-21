"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, MapPin, Plus, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { handleGetAddresses, handleAddAddress } from "@/lib/actions/profile-action";
import { handleCreateOrder, handleInitiateEsewa } from "@/lib/actions/order-action";

const formatPrice = (value: number) => `NRs. ${Number(value).toFixed(2)}`;

export default function CheckoutPage() {
    const { user, loading: authLoading } = useAuth();
    const { cart, loading: cartLoading, refresh } = useCart();
    const toast = useToast();
    const router = useRouter();

    const [addresses, setAddresses] = useState<any[]>([]);
    const [addressesLoading, setAddressesLoading] = useState(true);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"COD" | "ESEWA">("COD");
    const [showAddForm, setShowAddForm] = useState(false);
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState("");

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
            setAddressesLoading(true);
            const result = await handleGetAddresses();
            if (result.success) {
                const list = result.data.addresses;
                setAddresses(list);
                if (list.length > 0) {
                    setSelectedAddressId(list[0].id);
                } else {
                    setShowAddForm(true);
                }
            }
            setAddressesLoading(false);
        };
        load();
    }, [user]);

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
            const newAddress = result.data.address;
            setAddresses((prev) => [...prev, newAddress]);
            setSelectedAddressId(newAddress.id);
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

    const onPlaceOrder = async () => {
        if (!selectedAddressId) {
            setError("Please select or add a delivery address.");
            return;
        }

        setError("");
        setPlacing(true);

        if (paymentMethod === "ESEWA") {
            const result = await handleInitiateEsewa({ addressId: selectedAddressId });
            if (result.success && result.data.formUrl) {
                const form = document.createElement("form");
                form.method = "POST";
                form.action = result.data.formUrl;
                Object.entries(result.data.fields).forEach(([name, value]) => {
                    const input = document.createElement("input");
                    input.type = "hidden";
                    input.name = name;
                    input.value = String(value);
                    form.appendChild(input);
                });
                document.body.appendChild(form);
                form.submit();
                return;
            }
            setPlacing(false);
            setError(result.message || "Could not start eSewa payment.");
            toast.error("Could not start payment", result.message || "Please try again.");
            return;
        }

        const result = await handleCreateOrder({ addressId: selectedAddressId });
        setPlacing(false);

        if (result.success) {
            await refresh();
            toast.success("Order placed", "Thanks for your order!");
            router.push(`/orders/${result.data.order.id}?placed=1`);
        } else {
            setError(result.message || "Could not place order.");
            toast.error("Could not place order", result.message || "Please try again.");
        }
    };

    if (authLoading || !user) {
        return (
            <main className="flex flex-1 items-center justify-center py-24">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy-200 border-t-navy-600" />
            </main>
        );
    }

    if (!cartLoading && cart.items.length === 0) {
        return (
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
                <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-white px-4 py-20 text-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-50">
                        <ShoppingBag className="h-8 w-8 text-navy-300" />
                    </span>
                    <p className="mt-1 font-semibold text-navy-800">Your cart is empty.</p>
                    <p className="max-w-sm text-sm text-navy-400">Add some gear before checking out.</p>
                    <Link
                        href="/products"
                        className="mt-3 rounded-full bg-navy-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-navy-700"
                    >
                        Browse gear
                    </Link>
                </div>
            </main>
        );
    }

    const itemCount = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);

    return (
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
            <h1 className="text-2xl font-bold text-navy-800">Checkout</h1>

            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-6">
                    <section className="rounded-xl border border-border bg-white p-5">
                        <h2 className="flex items-center gap-2 text-base font-semibold text-navy-800">
                            <MapPin className="h-4 w-4" />
                            Delivery address
                        </h2>

                        {addressesLoading ? (
                            <div className="mt-4 flex justify-center py-8">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-navy-200 border-t-navy-600" />
                            </div>
                        ) : (
                            <>
                                {addresses.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {addresses.map((address) => (
                                            <label
                                                key={address.id}
                                                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 text-sm transition-colors ${
                                                    selectedAddressId === address.id
                                                        ? "border-navy-600 bg-navy-50"
                                                        : "border-border hover:border-navy-300"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    checked={selectedAddressId === address.id}
                                                    onChange={() => setSelectedAddressId(address.id)}
                                                    className="mt-0.5 accent-navy-600"
                                                />
                                                <span className="text-navy-700">
                                                    <span className="block font-medium text-navy-800">{address.line1}</span>
                                                    {address.line2 && <span className="block">{address.line2}</span>}
                                                    <span className="block">
                                                        {address.city}, {address.country} {address.zip}
                                                    </span>
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {showAddForm ? (
                                    <form onSubmit={onAddAddress} className="mt-4 space-y-3 border-t border-border pt-4">
                                        <input
                                            type="text"
                                            value={line1}
                                            onChange={(e) => setLine1(e.target.value)}
                                            placeholder="Address line 1"
                                            className="w-full rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none"
                                        />
                                        <input
                                            type="text"
                                            value={line2}
                                            onChange={(e) => setLine2(e.target.value)}
                                            placeholder="Address line 2 (optional)"
                                            className="w-full rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none"
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                placeholder="City"
                                                className="w-full rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none"
                                            />
                                            <input
                                                type="text"
                                                value={zip}
                                                onChange={(e) => setZip(e.target.value)}
                                                placeholder="ZIP / Postal code"
                                                className="w-full rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            placeholder="Country"
                                            className="w-full rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none"
                                        />
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="submit"
                                                disabled={savingAddress}
                                                className="rounded-full bg-navy-600 px-5 py-2 text-sm font-medium text-white hover:bg-navy-700 disabled:opacity-60"
                                            >
                                                {savingAddress ? "Saving…" : "Save address"}
                                            </button>
                                            {addresses.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAddForm(false)}
                                                    className="text-sm font-medium text-navy-400 hover:text-navy-700"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(true)}
                                        className="mt-4 flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:text-navy-800"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add a new address
                                    </button>
                                )}
                            </>
                        )}
                    </section>

                    <section className="rounded-xl border border-border bg-white p-5">
                        <h2 className="text-base font-semibold text-navy-800">Payment method</h2>
                        <div className="mt-4 space-y-2">
                            <label
                                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 text-sm transition-colors ${
                                    paymentMethod === "COD"
                                        ? "border-navy-600 bg-navy-50"
                                        : "border-border hover:border-navy-300"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === "COD"}
                                    onChange={() => setPaymentMethod("COD")}
                                    className="accent-navy-600"
                                />
                                <span className="font-medium text-navy-800">Cash on Delivery</span>
                            </label>

                            <label
                                className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3.5 text-sm transition-colors ${
                                    paymentMethod === "ESEWA"
                                        ? "border-navy-600 bg-navy-50"
                                        : "border-border hover:border-navy-300"
                                }`}
                            >
                                <span className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="payment"
                                        checked={paymentMethod === "ESEWA"}
                                        onChange={() => setPaymentMethod("ESEWA")}
                                        className="accent-navy-600"
                                    />
                                    <span className="font-medium text-navy-800">eSewa</span>
                                </span>
                                <span className="rounded-full bg-[#60bb46]/10 px-2 py-0.5 text-xs font-semibold text-[#3d8f2a]">
                                    Digital wallet
                                </span>
                            </label>

                            {["Visa / Mastercard", "Khalti"].map((method) => (
                                <label
                                    key={method}
                                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-3.5 text-sm text-navy-300"
                                >
                                    <span className="flex items-center gap-3">
                                        <input type="radio" disabled />
                                        {method}
                                    </span>
                                    <span className="rounded-full bg-navy-50 px-2 py-0.5 text-xs font-medium text-navy-400">
                                        Coming soon
                                    </span>
                                </label>
                            ))}
                        </div>
                    </section>
                </div>

                <aside className="sticky top-24 h-max rounded-xl border border-border bg-white p-5">
                    <h2 className="text-base font-semibold text-navy-800">Order summary</h2>

                    <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
                        {cart.items.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-3 text-sm">
                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-navy-50">
                                    {item.product.images?.[0] && (
                                        <img
                                            src={item.product.images[0]}
                                            alt={item.product.name}
                                            className="h-full w-full object-cover"
                                        />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium text-navy-800">{item.product.name}</p>
                                    <p className="text-xs text-navy-400">
                                        Qty {item.quantity}
                                        {item.size && ` · Size ${item.size}`}
                                    </p>
                                </div>
                                <p className="shrink-0 font-medium text-navy-800">
                                    {formatPrice(Number(item.product.price) * item.quantity)}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
                        <div className="flex items-center justify-between text-navy-500">
                            <span>Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"})</span>
                            <span className="font-medium text-navy-800">{formatPrice(cart.subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-navy-500">
                            <span className="flex items-center gap-1.5">
                                <Truck className="h-3.5 w-3.5" />
                                Delivery
                            </span>
                            <span className="text-success">Free</span>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                        <span className="font-semibold text-navy-800">Total</span>
                        <span className="text-lg font-bold text-navy-800">{formatPrice(cart.subtotal)}</span>
                    </div>

                    {error && (
                        <p className="mt-4 rounded-lg border border-danger/30 bg-danger/5 px-3.5 py-2.5 text-xs text-danger">
                            {error}
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={onPlaceOrder}
                        disabled={placing || !selectedAddressId}
                        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full bg-navy-600 px-6 py-3 text-sm font-semibold text-white hover:bg-navy-700 disabled:opacity-60"
                    >
                        <Lock className="h-3.5 w-3.5" />
                        {placing
                            ? paymentMethod === "ESEWA"
                                ? "Redirecting to eSewa…"
                                : "Placing order…"
                            : paymentMethod === "ESEWA"
                                ? "Pay with eSewa"
                                : "Place order"}
                    </button>

                    <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-navy-300">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Secure checkout
                    </p>
                </aside>
            </div>
        </main>
    );
}
