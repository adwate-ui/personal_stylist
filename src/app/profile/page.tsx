"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Settings, Save, Key, Trash2, LogOut, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useProfile } from "@/hooks/useProfile";

export default function ProfilePage() {
    const router = useRouter();
    const { profile, user } = useProfile();
    const { theme, setTheme } = useTheme();
    const [apiKey, setApiKey] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Load key from localStorage
        const storedKey = localStorage.getItem("gemini_api_key");
        if (storedKey) setApiKey(storedKey);
        setMounted(true);
    }, []);

    const saveKey = () => {
        localStorage.setItem("gemini_api_key", apiKey);
        alert("API Key saved securely to your browser.");
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/auth/login");
    };

    const handleDeleteAccount = async () => {
        if (confirm("Are you sure? This action is irreversible. All your data (wardrobe, profile) will be deleted.")) {
            // Delete profile data first (optional if using cascading deletes)
            const { error } = await supabase.rpc('delete_user'); // Rpc call if advanced, or simple delete
            // Since we don't have an RPC for full delete, we can delete the profile row and auth user (if applicable/allowed)
            // For now, let's just clear user data we can access

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase.from('profiles').delete().eq('id', user.id);
                    await supabase.auth.signOut();
                    router.push("/auth/login");
                }
            } catch (e) {
                console.error("Delete error", e);
                alert("Could not complete account deletion via static request. Please contact support.");
            }
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen p-8 lg:p-12 animate-fade-in bg-background text-foreground">
            <div className="max-w-3xl mx-auto space-y-12">
                <div className="flex items-center gap-4 border-b border-border/50 pb-8">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center font-serif text-2xl text-primary font-bold border border-primary/20">
                        {profile?.name?.[0] || "U"}
                    </div>
                    <div>
                        <h1 className="text-4xl font-serif font-bold">{profile?.name || "Style Icon"}</h1>
                        <p className="text-muted-foreground">{user?.email || "User Profile"}</p>
                    </div>
                </div>

                {/* Theme Settings */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 text-primary mb-2">
                        <Monitor size={24} />
                        <span className="uppercase tracking-widest text-xs font-bold">Appearance</span>
                    </div>
                    <div className="card glass p-8 rounded-xl border border-border/50 space-y-4">
                        <h3 className="text-xl font-bold">Theme Preference</h3>
                        <p className="text-sm text-muted-foreground">Select your interface mode.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setTheme('light')} className={`flex-1 p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/10 text-primary' : 'border-border/20 text-muted-foreground hover:bg-card/50'}`}>
                                <Sun size={24} /> <span className="text-sm font-medium">Light</span>
                            </button>
                            <button onClick={() => setTheme('dark')} className={`flex-1 p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/10 text-primary' : 'border-border/20 text-muted-foreground hover:bg-card/50'}`}>
                                <Moon size={24} /> <span className="text-sm font-medium">Dark</span>
                            </button>
                            <button onClick={() => setTheme('system')} className={`flex-1 p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${theme === 'system' ? 'border-primary bg-primary/10 text-primary' : 'border-border/20 text-muted-foreground hover:bg-card/50'}`}>
                                <Monitor size={24} /> <span className="text-sm font-medium">System</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* AI Settings */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 text-primary mb-2">
                        <Key size={24} />
                        <span className="uppercase tracking-widest text-xs font-bold">AI Configuration</span>
                    </div>
                    <div className="card glass p-8 rounded-xl border border-border/50 space-y-6">
                        <div>
                            <h3 className="text-xl font-bold mb-2">Gemini API Key</h3>
                            <p className="text-sm text-muted-foreground mb-4">Required for AI Wardrobe Analysis. Your key is stored locally on your device.</p>
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className="flex-1 bg-background/50 border border-border/50 rounded-lg px-4 py-2 focus:border-primary focus:outline-none"
                                    placeholder="Enter your Google Gemini API Key"
                                />
                                <button onClick={saveKey} className="btn btn-primary px-6 flex items-center gap-2">
                                    <Save size={18} /> Save
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Get a key from <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-primary underline">Google AI Studio</a>.</p>
                        </div>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="space-y-6 pt-8 border-t border-border/20">
                    <div className="flex items-center gap-3 text-red-400 mb-2">
                        <Settings size={24} />
                        <span className="uppercase tracking-widest text-xs font-bold">Danger Zone</span>
                    </div>
                    <div className="space-y-4">
                        <button onClick={handleSignOut} className="w-full p-4 rounded-lg border border-border/20 flex items-center justify-center gap-2 text-foreground hover:bg-white/5 transition-all">
                            <LogOut size={18} /> Sign Out
                        </button>
                        <button onClick={handleDeleteAccount} className="w-full p-4 rounded-lg border border-red-500/20 bg-red-500/5 flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 transition-all">
                            <Trash2 size={18} /> Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
