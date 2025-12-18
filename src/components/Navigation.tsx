"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shirt, PlusCircle, Settings, LogOut, Sparkles, Dna } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Navigation() {
    const pathname = usePathname();
    const router = useRouter();
    const { profile, loading, clearProfile } = useProfile();

    // Hide navigation on landing page, onboarding, and auth pages
    const isHidden = pathname === "/" || pathname?.startsWith("/onboarding") || pathname?.startsWith("/auth");

    if (isHidden) return null;

    const navItems = [
        { name: "Wardrobe", href: "/wardrobe", icon: Shirt },
        { name: "Add Item", href: "/add-item", icon: PlusCircle },
        { name: "Style DNA", href: "/style-dna", icon: Dna },
        { name: "Preferences", href: "/preferences", icon: Settings },
    ];

    const handleSignOut = async () => {
        if (confirm("Are you sure you want to sign out?")) {
            await supabase.auth.signOut();
            clearProfile();
            router.push("/");
            router.refresh(); // Refresh to update middleware state
        }
    };

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

                {/* User Profile Section */}
                {!isHidden && (
                    <div className="mb-4 p-4 bg-white/5 backdrop-blur border border-white/10 rounded-xl mx-2">
                        {loading ? (
                            <div className="flex flex-col items-center animate-pulse">
                                <div className="w-12 h-12 bg-gray-700/50 rounded-full mb-3" />
                                <div className="h-4 w-20 bg-gray-700/50 rounded" />
                            </div>
                        ) : (
                            <Link href="/preferences" className="flex flex-col items-center group cursor-pointer hover:bg-white/5 transition-colors rounded-lg p-2 -m-2">
                                {profile.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt={profile.name || "User"}
                                        className="w-12 h-12 rounded-full border-2 border-primary/30 shadow-lg shadow-primary/10 object-cover mb-3"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30 shadow-lg shadow-primary/10 mb-3">
                                        <span className="text-primary font-bold text-xl">
                                            {profile.name
                                                ? profile.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
                                                : "U"}
                                        </span>
                                    </div>
                                )}
                                <span className="text-gray-300 text-sm font-medium truncate max-w-[180px] group-hover:text-white transition-colors">
                                    {profile.name || "User"}
                                </span>
                            </Link>
                        )}
                    </div>
                )}

                <div className="pt-6 border-t border-white/10">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white transition-colors w-full rounded-xl hover:bg-white/5"
                    >
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
