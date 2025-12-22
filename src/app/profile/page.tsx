"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Settings, Save, Key, Trash2, LogOut, Moon, Sun, Monitor, Upload, Sparkles, User, Shield, CreditCard, ChevronRight, Camera } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

export default function ProfilePage() {
    const router = useRouter();
    const { profile, user, saveProfile } = useProfile();
    const { theme, setTheme } = useTheme();
    const [apiKey, setApiKey] = useState("");
    const [imageExtractorKey, setImageExtractorKey] = useState("");
    const [isEditingKey, setIsEditingKey] = useState(false);
    const [isEditingExtractorKey, setIsEditingExtractorKey] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);

        // Load Gemini Key
        if (profile.gemini_api_key) {
            setApiKey(profile.gemini_api_key);
            setIsEditingKey(false);
        } else {
            const stored = localStorage.getItem("gemini_api_key");
            if (stored) {
                setApiKey(stored);
                setIsEditingKey(false);
            } else {
                setIsEditingKey(true);
            }
        }

        // Load Image Extractor Key
        if (profile.image_extractor_api_key) {
            setImageExtractorKey(profile.image_extractor_api_key);
            setIsEditingExtractorKey(false);
        } else {
            const stored = localStorage.getItem("image_extractor_api_key");
            if (stored) {
                setImageExtractorKey(stored);
                setIsEditingExtractorKey(false);
            } else {
                setIsEditingExtractorKey(true);
            }
        }
    }, [profile.gemini_api_key, profile.image_extractor_api_key]);

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
        toast.success("API Key saved securely.");
    };

    const handleSaveExtractorKey = async () => {
        if (!imageExtractorKey.trim()) {
            toast.error("Please enter a valid Image Extractor API key");
            return;
        }
        localStorage.setItem("image_extractor_api_key", imageExtractorKey);
        await saveProfile({ image_extractor_api_key: imageExtractorKey });
        setIsEditingExtractorKey(false);
        toast.success("Image Extractor Key saved.");
    };

    const handleSignOut = async () => {
        const toastId = toast.loading("Signing out...");
        await supabase.auth.signOut();
        toast.dismiss(toastId);
        router.push("/auth/login");
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Are you sure? This action is irreversible. All your data (wardrobe, profile) will be deleted.")) {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase.from('profiles').delete().eq('id', user.id);
                    await supabase.auth.signOut();
                    router.push("/auth/login");
                }
            } catch (e) {
                console.error("Delete error", e);
                toast.error("Could not complete account deletion. Please contact support.");
            }
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Hero Section */}
            <div className="relative h-[300px] w-full overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-0" />
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:32px_32px] z-0" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10" />

                <div className="relative z-20 container mx-auto px-6 h-full flex flex-col items-center justify-center pt-10">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full border-4 border-background shadow-2xl overflow-hidden relative bg-black/50 backdrop-blur-md">
                            {profile?.avatar_url ? (
                                <Image
                                    src={profile.avatar_url}
                                    alt={profile.name || "Profile"}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-serif text-primary/50">
                                    {profile?.name?.[0] || "U"}
                                </div>
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 p-2 bg-primary text-black rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform hover:bg-white">
                            <Camera size={18} />
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={async (e) => {
                                    if (!e.target.files?.[0]) return;
                                    const file = e.target.files[0];
                                    const toastId = toast.loading("Uploading avatar...");
                                    try {
                                        const fileExt = file.name.split('.').pop();
                                        const fileName = `${user?.id || 'unknown'}/${Date.now()}.${fileExt}`;
                                        const { error: uploadError } = await supabase.storage
                                            .from('avatars')
                                            .upload(fileName, file);

                                        if (uploadError) throw uploadError;

                                        const { data: { publicUrl } } = supabase.storage
                                            .from('avatars')
                                            .getPublicUrl(fileName);

                                        await saveProfile({ avatar_url: publicUrl });
                                        toast.success("Avatar updated!", { id: toastId });
                                    } catch (err) {
                                        console.error(err);
                                        toast.error("Failed to upload avatar", { id: toastId });
                                    }
                                }}
                            />
                        </label>
                    </div>
                    <h1 className="text-3xl font-serif font-bold mt-4">{profile?.name || "Style Icon"}</h1>
                    <p className="text-muted-foreground">{user?.email}</p>

                    <div className="flex gap-2 mt-4">
                        {profile?.archetypes?.map(arch => (
                            <span key={arch} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs uppercase tracking-wider text-primary/80">
                                {arch}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 -mt-10 relative z-30">
                <style jsx global>{`
                    .glass-card {
                        @apply bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-white/20 transition-all duration-300;
                    }
                    .section-title {
                        @apply text-sm uppercase tracking-widest font-bold text-muted-foreground mb-4 pl-2 flex items-center gap-2;
                    }
                `}</style>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Main Settings */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* AI Intelligence */}
                        <section>
                            <div className="section-title text-primary"><Sparkles size={16} /> Virtual Stylist Intelligence</div>
                            <div className="glass-card p-8">
                                <div className="flex items-start justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">Gemini Pro Configuration</h3>
                                        <p className="text-muted-foreground text-sm max-w-md">
                                            Your personal API key superpowers the AI stylist. It enables deep analysis of your wardrobe, trend forecasting, and outfit generation.
                                        </p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${apiKey ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'}`}>
                                        {apiKey ? 'ACTIVE' : 'SETUP REQUIRED'}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {!isEditingKey && apiKey ? (
                                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                                <Key size={20} />
                                            </div>
                                            <div className="flex-1 font-mono text-sm text-gray-400">
                                                •••• •••• •••• {apiKey.slice(-4)}
                                            </div>
                                            <button onClick={() => setIsEditingKey(true)} className="text-xs font-bold text-primary hover:underline uppercase tracking-wide">
                                                Configure
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Enter API Key</label>
                                            <div className="flex gap-3">
                                                <input
                                                    type="password"
                                                    value={apiKey}
                                                    onChange={(e) => setApiKey(e.target.value)}
                                                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-sm transition-all"
                                                    placeholder="Paste your Gemini API key here..."
                                                />
                                                <button
                                                    onClick={handleSaveKey}
                                                    className="btn btn-primary px-6 rounded-xl font-bold"
                                                >
                                                    <Save size={18} className="mr-2" /> Save Active Key
                                                </button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Don't have a key? <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-primary hover:underline">Generate one freely at Google AI Studio</a>.
                                            </p>
                                        </div>
                                    )}

                                    <div className="pt-6 border-t border-white/5">
                                        <button
                                            className="flex items-center justify-between w-full text-left group"
                                            onClick={() => setIsEditingExtractorKey(!isEditingExtractorKey)}
                                        >
                                            <div>
                                                <div className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">Advanced: Image Extraction API</div>
                                                <div className="text-xs text-muted-foreground">Optional key for high-fidelity product imports</div>
                                            </div>
                                            <ChevronRight size={16} className={`text-muted-foreground transition-transform ${isEditingExtractorKey ? 'rotate-90' : ''}`} />
                                        </button>

                                        {isEditingExtractorKey && (
                                            <div className="mt-4 animate-fade-in space-y-3">
                                                <input
                                                    type="password"
                                                    value={imageExtractorKey}
                                                    onChange={(e) => setImageExtractorKey(e.target.value)}
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-sm transition-all"
                                                    placeholder="Paste Image Extractor Key..."
                                                />
                                                <button
                                                    onClick={handleSaveExtractorKey}
                                                    className="w-full btn btn-outline py-2 rounded-lg text-xs font-bold uppercase"
                                                >
                                                    Update Extractor Key
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Personal Details */}
                        <section>
                            <div className="section-title"><User size={16} /> Personal Style Profile</div>
                            <div className="glass-card p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Style DNA</label>
                                        <div className="font-serif text-lg">{profile?.styleDNA?.archetype_name || "Unidentified"}</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Body Shape</label>
                                        <div className="font-serif text-lg">{profile.bodyShape || "Not set"}</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Skin Tone</label>
                                        <div className="font-serif text-lg">{profile.skinTone || "Not set"}</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors" onClick={() => router.push('/onboarding?mode=regenerate')}>
                                        <span className="text-primary text-sm font-bold uppercase tracking-wider">Refine Style Profile →</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="space-y-8">

                        {/* Appearance / Theme */}
                        <section>
                            <div className="section-title"><Monitor size={16} /> Appearance</div>
                            <div className="glass-card p-6">
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${theme === 'light' ? 'bg-primary text-black border-primary' : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'}`}
                                    >
                                        <Sun size={24} />
                                        <span className="text-xs font-bold uppercase">Light</span>
                                    </button>
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${theme === 'dark' ? 'bg-primary text-black border-primary' : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'}`}
                                    >
                                        <Moon size={24} />
                                        <span className="text-xs font-bold uppercase">Dark</span>
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Account Actions */}
                        <section>
                            <div className="section-title"><Settings size={16} /> Account</div>
                            <div className="glass-card divide-y divide-white/10">
                                <button
                                    onClick={handleSignOut}
                                    className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/5 transition-colors text-sm font-medium"
                                >
                                    <LogOut size={18} className="text-muted-foreground" />
                                    Sign Out
                                </button>
                                <button
                                    className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/5 transition-colors text-sm font-medium opacity-50 cursor-not-allowed"
                                >
                                    <CreditCard size={18} className="text-muted-foreground" />
                                    Manage Subscription
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="w-full p-4 flex items-center gap-3 text-left hover:bg-red-500/10 transition-colors text-sm font-medium text-red-500"
                                >
                                    <Trash2 size={18} />
                                    Delete Account
                                </button>
                            </div>
                        </section>

                        <div className="text-center text-xs text-muted-foreground pb-8">
                            <p>Personal Stylist v1.2.0</p>
                            <p>ID: {user?.id?.slice(0, 8)}</p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
