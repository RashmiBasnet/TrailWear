import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-navy-50 px-4 py-10">
            <div className="relative grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-2">
                <aside className="relative hidden min-w-0 overflow-hidden bg-navy-900 lg:block">
                    <img
                        src="/hero-auth.png"
                        alt=""
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                    />
                    <Link href="/" className="absolute left-8 top-8 z-10 flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                            <img src="/logo2.png" alt="TrailWear logo" className="h-6 w-auto" />
                        </span>
                        <span className="text-navy-600">
                            <span className="font-medium">Trail</span>
                            <span className="font-extrabold">Wear</span>
                        </span>
                    </Link>
                </aside>

                <section className="relative flex flex-col px-6 py-8 sm:px-10 sm:py-10">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/"
                            className="flex items-center gap-1.5 text-sm font-medium text-navy-400 hover:text-navy-700"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to store
                        </Link>
                        <Link href="/" className="flex items-center gap-2 lg:hidden">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cream">
                                <img src="/logo2.png" alt="TrailWear logo" className="h-5 w-auto" />
                            </span>
                            <span className="text-navy-800">
                                <span className="font-medium">Trail</span>
                                <span className="font-extrabold">Wear</span>
                            </span>
                        </Link>
                    </div>

                    <div className="flex flex-1 items-center justify-center py-8">
                        {children}
                    </div>
                </section>
            </div>
        </main>
    );
}
