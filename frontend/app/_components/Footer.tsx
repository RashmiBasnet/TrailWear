import Link from "next/link";

export default function Footer() {
    return (
        <footer className="mt-auto bg-navy-800">
            <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
                <div>
                    <p className="mb-2 flex items-center gap-2 text-white">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                            <img src="/logo2.png" alt="TrailWear logo" className="h-6 w-auto" />
                        </span>
                        <span className="text-lg">
                            <span className="font-medium">Trail</span>
                            <span className="font-extrabold">Wear</span>
                        </span>
                    </p>
                    <p className="text-sm leading-relaxed text-navy-200">
                        Trekking and outdoor gear for every trail, from day hikes to high-altitude expeditions.
                    </p>
                </div>
                <div>
                    <p className="mb-2 text-sm font-semibold text-white">Shop</p>
                    <ul className="space-y-1.5 text-sm text-navy-200">
                        <li><Link href="/products" className="hover:text-gold-300">All products</Link></li>
                        <li><Link href="/products" className="hover:text-gold-300">Categories</Link></li>
                        <li><Link href="/products" className="hover:text-gold-300">New arrivals</Link></li>
                    </ul>
                </div>
                <div>
                    <p className="mb-2 text-sm font-semibold text-white">Support</p>
                    <ul className="space-y-1.5 text-sm text-navy-200">
                        <li><Link href="/profile" className="hover:text-gold-300">My account</Link></li>
                        <li><Link href="/cart" className="hover:text-gold-300">My cart</Link></li>
                        <li><Link href="/wishlist" className="hover:text-gold-300">My wishlist</Link></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-navy-700">
                <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 text-xs text-navy-300 sm:flex-row sm:justify-between">
                    <span>© 2026 TrailWear · Kathmandu, Nepal</span>
                    <span>Visa · Mastercard · eSewa · Khalti</span>
                </div>
            </div>
        </footer>
    );
}
