"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shirt, PlusCircle, Settings, LogOut, Sparkles, Dna, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import Image from "next/image";

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
        { name: "Daily Outfit", href: "/outfit-of-the-day", icon: Sparkles },
        { name: "Weekly Picks", href: "/recommendations", icon: ShoppingBag },
    ];

    const handleSignOut = async () => {
        if (confirm("Are you sure you want to sign out?")) {
            if (isSupabaseConfigured) {
                await supabase.auth.signOut();
            }
            clearProfile();
            router.push("/");
            router.refresh(); // Refresh to update middleware state
        }
    };

    return (
        <>
            {/* Desktop Sidebar */}
            {/* Added persistence logic manually without extra lib to keep it simple */}
            <SidebarNav navItems={navItems} profile={profile} loading={loading} handleSignOut={handleSignOut} />

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

function SidebarNav({ navItems, profile, loading, handleSignOut }: any) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("sidebar_collapsed");
        if (stored) setIsCollapsed(JSON.stringify(stored) === '"true"'); // Simple check
    }, []);

    const toggleSidebar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem("sidebar_collapsed", JSON.stringify(newState));
    };

    // Quick rename for consistency
    const SidebarIcon = isCollapsed ? ChevronRight : ChevronLeft;

    return (
        <aside className={`${isCollapsed ? 'w-20' : 'w-64'} hidden md:flex flex-col bg-black/40 backdrop-blur-xl border-r border-white/10 h-screen fixed left-0 top-0 p-4 z-50 transition-all duration-300`}>
            <button onClick={toggleSidebar} className="absolute -right-3 top-8 bg-surface border border-white/10 rounded-full p-1 text-gray-400 hover:text-white">
                <SidebarIcon size={14} />
            </button>

            <div className={`flex items-center gap-2 mb-10 px-2 text-primary overflow-hidden whitespace-nowrap ${isCollapsed ? 'justify-center' : ''}`}>
                <Sparkles size={24} className="shrink-0" />
                {!isCollapsed && <span className="font-serif text-xl font-bold tracking-tight">Gemini Stylist</span>}
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item: any) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={isCollapsed ? item.name : ""}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden whitespace-nowrap ${isActive
                                ? "bg-primary text-black font-medium shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <item.icon size={20} className={`shrink-0 ${isActive ? "text-black" : "group-hover:text-primary transition-colors"}`} />
                            {!isCollapsed && <span>{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Profile & Logout - Simplified for collapsed state */}
            <div className="pt-6 border-t border-white/10 space-y-4">
                <Link href="/profile" className={`flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0 text-xs font-bold text-primary relative overflow-hidden">
                        {profile?.avatar_url ? (
                            <Image
                                src={profile.avatar_url}
                                alt={profile.name || "Profile"}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            profile?.name?.[0] || "U"
                        )}
                    </div>
                    {!isCollapsed && <span className="text-sm truncate">{profile?.name || "Profile"}</span>}
                </Link>

                <button
                    onClick={handleSignOut}
                    className={`flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-white transition-colors w-full rounded-xl hover:bg-white/5 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}
                    title="Sign Out"
                >
                    <LogOut size={20} className="shrink-0" />
                    {!isCollapsed && <span>Sign Out</span>}
                </button>
            </div>
        </aside>
    );
}
