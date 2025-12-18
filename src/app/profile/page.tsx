"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Settings, Save, Key, Trash2, LogOut, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

export default function ProfilePage() {
    const router = useRouter();
    const { profile, user, saveProfile } = useProfile();
    const { theme, setTheme } = useTheme();
    const [apiKey, setApiKey] = useState("");
    const [isEditingKey, setIsEditingKey] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        if (profile.gemini_api_key) {
            setApiKey(profile.gemini_api_key);
            setIsEditingKey(false); // Key exists, don't show edit mode
        } else {
            // Fallback to local storage if not in profile yet
            const stored = localStorage.getItem("gemini_api_key");
            if (stored) {
                setApiKey(stored);
                setIsEditingKey(false);
            } else {
                setIsEditingKey(true); // No key, show input
            }
        }
    }, [profile.gemini_api_key]);

    const handleSaveKey = async () => {
        if (!apiKey.trim()) {
            toast.error("Please enter a valid API key");
            return;
        }
        // Save to LocalStorage
        localStorage.setItem("gemini_api_key", apiKey);
        // Save to DB
        await saveProfile({ gemini_api_key: apiKey });
        setIsEditingKey(false);
        toast.success("API Key saved to your account and device.");
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/auth/login");
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Are you sure? This action is irreversible. All your data (wardrobe, profile) will be deleted.")) {
            // Delete profile data first (optional if using cascading deletes)
            await supabase.rpc('delete_user'); // Rpc call if advanced, or simple delete
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
                toast.error("Could not complete account deletion via static request. Please contact support.");
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

                {/* API Key Setup Alert */}
                {!apiKey && (
                    <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 space-y-3">
                        <div className="flex items-start gap-3">
                            <Key size={24} className="text-primary flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-lg font-bold text-primary">⚠️ Action Required: Set Your Gemini API Key</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    To use AI-powered wardrobe analysis and shopping recommendations, you need to provide your own Google Gemini API key.
                                    This key is securely stored in your profile and used exclusively for your requests.
                                </p>
                                <p className="text-sm text-primary/80 mt-2 font-medium">
                                    👇 Scroll down to &quot;AI Configuration&quot; section to add your key.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

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
                            <h3 className="text-xl font-bold mb-2">Your Gemini API Key</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Your personal API key for AI analysis. This key is used exclusively for your requests and is stored securely in your profile.
                                <strong className="text-primary"> No default keys are used.</strong>
                            </p>

                            {!isEditingKey && apiKey ? (
                                // Show masked key with edit button
                                <div className="space-y-3">
                                    <div className="flex gap-2 items-center">
                                        <div className="flex-1 bg-background/50 border border-border/50 rounded-lg px-4 py-2 font-mono text-sm">
                                            {"•".repeat(32)} {apiKey.slice(-4)}
                                        </div>
                                        <button
                                            onClick={() => setIsEditingKey(true)}
                                            className="btn btn-outline px-6 flex items-center gap-2"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                    <p className="text-xs text-green-600 dark:text-green-400">✓ API Key configured</p>
                                </div>
                            ) : (
                                // Show input for new/editing key
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="password"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            className="flex-1 bg-background/50 border border-border/50 rounded-lg px-4 py-2 focus:border-primary focus:outline-none"
                                            placeholder="Enter your Google Gemini API Key"
                                        />
                                        <button onClick={handleSaveKey} className="btn btn-primary px-6 flex items-center gap-2">
                                            <Save size={18} /> Save
                                        </button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Get a key from <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-primary underline">Google AI Studio</a>.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-red-400 mb-2 pt-6">
                    <Settings size={24} />
                    <span className="uppercase tracking-widest text-xs font-bold">Danger Zone</span>
                </div>
                <div className="space-y-4">
                    <button onClick={handleDeleteAccount} className="w-full p-4 rounded-lg border border-red-500/20 bg-red-500/5 flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 size={18} /> Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
}
