"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shirt, PlusCircle, Settings, LogOut, Sparkles } from "lucide-react";

export default function Navigation() {
    const pathname = usePathname();

    // Hide navigation on landing page, onboarding, and auth pages
    const isHidden = pathname === "/" || pathname?.startsWith("/onboarding") || pathname?.startsWith("/auth");

    if (isHidden) return null;

    const navItems = [
        { name: "Wardrobe", href: "/wardrobe", icon: Shirt },
        { name: "Add Item", href: "/add-item", icon: PlusCircle },
        { name: "Preferences", href: "/preferences", icon: Settings },
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 h-screen fixed left-0 top-0 p-6 z-50">
                <div className="flex items-center gap-2 mb-10 px-2 text-primary">
                    <Sparkles size={24} />
                    <span className="font-serif text-xl font-bold tracking-tight">Gemini Stylist</span>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                        ? "bg-primary text-black font-medium shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <item.icon size={20} className={isActive ? "text-black" : "group-hover:text-primary transition-colors"} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="pt-6 border-t border-white/10">
                    <button className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white transition-colors w-full rounded-xl hover:bg-white/5">
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/10 p-4 z-50 flex justify-around items-center pb-8 safe-area-pb">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${isActive ? "text-primary" : "text-gray-500 hover:text-white"
                                }`}
                        >
                            <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
