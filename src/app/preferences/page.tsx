"use client";

import { useState, useEffect } from "react";
import { Save, User, Ruler, Palette, Shirt, RefreshCw, Sparkles } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";

export default function PreferencesPage() {
    const router = useRouter();
    const { profile, saveProfile, loading } = useProfile();
    const [formData, setFormData] = useState(profile);

    useEffect(() => {
        if (!loading) {
            setFormData(profile);
        }
    }, [profile, loading]);

    const handleSave = () => {
        saveProfile(formData);
        alert("Preferences saved!");
    };

    const handleRedoOnboarding = () => {
        if (confirm("This will reset your style profile. Continue?")) {
            router.push("/onboarding");
        }
    };

    const archetypes = ["Old Money", "Minimalist", "High Street", "Classic", "Bohemian", "Avant-Garde", "Ivy League", "Glamorous"];

    const toggleArchetype = (style: string) => {
        setFormData(prev => ({
            ...prev,
            archetypes: prev.archetypes.includes(style)
                ? prev.archetypes.filter(s => s !== style)
                : [...prev.archetypes, style]
        }));
    };

    if (loading) return <div className="p-8 text-center">Loading profile...</div>;

    return (
        <div className="p-8 pb-20 max-w-4xl mx-auto">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-serif font-bold mb-2">Style Preferences</h1>
                    <p className="text-gray-400">Manage your Style DNA and account settings.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleRedoOnboarding} className="btn btn-outline text-sm">
                        <RefreshCw size={16} className="mr-2" /> Redo Onboarding
                    </button>
                    <button onClick={handleSave} className="btn btn-primary">
                        <Save size={20} className="mr-2" /> Save Changes
                    </button>
                </div>
            </header>

            {/* Style DNA Report */}
            <div className="mb-12 glass p-8 border-[#d4af37]/20 border">
                <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="text-primary" />
                    <h2 className="text-2xl font-serif font-bold">Your Style DNA</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Core Archetypes</h3>
                        <div className="flex flex-wrap gap-2">
                            {/* Ensure archetypes is an array */}
                            {(formData.archetypes || []).map(a => (
                                <span key={a} className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full font-medium">
                                    {a}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Preferred Brands</h3>
                        <div className="flex flex-wrap gap-2">
                            {/* Safe handling for brands which might be string or array */}
                            {(typeof formData.brands === 'string'
                                ? (formData.brands as string).split(',')
                                : (Array.isArray(formData.brands) ? formData.brands : [])
                            ).map((b: string) => (
                                <span key={b} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm">
                                    {b.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {/* Section 1: Basic Info */}
                <section className="card glass p-8 animate-fade-in">
                    <div className="flex items-center gap-3 text-primary mb-6">
                        <User size={24} />
                        <h2 className="text-xl font-bold uppercase tracking-wider">Profile</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label>Display Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label>Location</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>
                </section>

                {/* Section 2: Measurements */}
                <section className="card glass p-8 animate-fade-in delay-100">
                    <div className="flex items-center gap-3 text-primary mb-6">
                        <Ruler size={24} />
                        <h2 className="text-xl font-bold uppercase tracking-wider">Measurements</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label>Height (cm)</label>
                            <input
                                type="number"
                                value={formData.height}
                                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                            />
                        </div>
                        <div>
                            <label>Weight (kg)</label>
                            <input
                                type="number"
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            />
                        </div>
                        <div>
                            <label>Body Shape</label>
                            <select
                                value={formData.bodyShape}
                                onChange={(e) => setFormData({ ...formData, bodyShape: e.target.value })}
                            >
                                {['Inverted Triangle', 'Rectangle', 'Triangle', 'Hourglass', 'Oval'].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                {/* Section 3: Style Archetypes */}
                <section className="card glass p-8 animate-fade-in delay-200">
                    <div className="flex items-center gap-3 text-primary mb-6">
                        <Shirt size={24} />
                        <h2 className="text-xl font-bold uppercase tracking-wider">Archetypes</h2>
                    </div>
                    <p className="text-gray-400 mb-4">Select the styles that influence your wardrobe.</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {archetypes.map(style => (
                            <button
                                key={style}
                                onClick={() => toggleArchetype(style)}
                                className={`p-3 rounded-xl border text-sm transition-all ${formData.archetypes.includes(style)
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-white/10 hover:bg-white/5'
                                    }`}
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
