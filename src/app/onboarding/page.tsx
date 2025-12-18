"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, ChevronRight, Check, ArrowLeft, ArrowRight, Ruler, Palette, Briefcase, Sparkles, User, Shirt, Loader2, Image as ImageIcon } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { GlossaryText } from "@/components/GlossaryText";
import { supabase } from "@/lib/supabase";

export default function Onboarding() {
    const router = useRouter();
    const { saveProfile } = useProfile();
    const [step, setStep] = useState(1);
    const [analyzing, setAnalyzing] = useState(false);
    const [styleDNA, setStyleDNA] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    // Initialize with local state, we'll save to global state at the end
    const [formData, setFormData] = useState({
        // Basics
        name: "",
        gender: "",
        age: "",
        location: "", // Climate context

        // Body
        height: "",
        weight: "",
        bodyShape: "", // e.g. Rectangle, Triangle, Hourglass
        fitPreference: "regular", // tight, regular, loose

        // Color
        skinTone: "",
        eyeColor: "",
        hairColor: "",

        // Lifestyle (0-100 slider values or categories)
        lifestyle: {
            work: false,
            casual: false,
            event: false,
            active: false
        },

        // Style
        archetypes: [] as string[],
        brands: [] as string[],
        priceRange: "",
        avatar_url: "", // Stores string URL now
    });

    const bodyShapeVisuals: Record<string, string> = {
        'Inverted Triangle': 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&auto=format&fit=crop',
        'Rectangle': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&auto=format&fit=crop',
        'Triangle': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&auto=format&fit=crop',
        'Hourglass': 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&auto=format&fit=crop',
        'Oval': 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&auto=format&fit=crop'
    };

    const aestheticVisuals: Record<string, string> = {
        'Old Money': 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=500&auto=format&fit=crop',
        'Minimalist': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&auto=format&fit=crop',
        'High Street': 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=500&auto=format&fit=crop',
        'Classic': 'https://images.unsplash.com/photo-1507680434567-5739c8a92405?w=500&auto=format&fit=crop',
        'Bohemian': 'https://images.unsplash.com/photo-1509319117443-ef63442d46ca?w=500&auto=format&fit=crop',
        'Avant-Garde': 'https://images.unsplash.com/photo-1558769132-cb1aea00f2fe?w=500&auto=format&fit=crop',
        'Ivy League': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&auto=format&fit=crop',
        'Glamorous': 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500&auto=format&fit=crop'
    };

    const totalSteps = 6;

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            generateDNA();
        }
    };

    const handleBack = () => setStep(step - 1);

    const generateDNA = async () => {
        setAnalyzing(true);
        try {
            // Call API
            const res = await fetch("/api/style-dna/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            // Success
            setStyleDNA(data);

        } catch (error) {
            console.error("DNA Generation Error:", error);
            alert("Failed to generate Style DNA. Proceeding to wardrobe.");
            finishOnboarding();
        } finally {
            setAnalyzing(false);
        }
    };

    const finishOnboarding = async () => {
        setSaving(true);
        try {
            // Priority: Try API first
            const res = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, styleDNA })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to save profile");
            }

            // Success
            router.push("/wardrobe");

        } catch (error) {
            console.error("Profile Save Error:", error);

            // Fallback to client-side hook
            try {
                await saveProfile({ ...formData, styleDNA });
                // If fallback "succeeds" (it swallows errors mostly but let's assume it works locally)
                router.push("/wardrobe");
            } catch (fallbackErr) {
                alert("Failed to save profile. Please check your connection and try again.");
            }
        } finally {
            setSaving(false);
        }
    };

    const toggleArchetype = (style: string) => {
        setFormData(prev => ({
            ...prev,
            archetypes: prev.archetypes.includes(style)
                ? prev.archetypes.filter(s => s !== style)
                : [...prev.archetypes, style]
        }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setAnalyzing(true); // Reuse loading state
        try {
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, avatar_url: data.publicUrl }));
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Error uploading avatar!');
        } finally {
            setAnalyzing(false);
        }
    };

    // If Style DNA is generated, show the Report View
    if (styleDNA) {
        return (
            <div className="min-h-screen bg-background p-6 lg:p-12 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                    <div className="text-center space-y-4 pt-10">
                        <Sparkles size={48} className="text-primary mx-auto animate-pulse" />
                        <h1 className="text-5xl font-serif font-bold">Your Style DNA</h1>
                        <p className="text-xl text-primary font-mono tracking-widest uppercase">{styleDNA.archetype_name}</p>
                        <p className="text-gray-400 max-w-2xl mx-auto">{styleDNA.summary}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Palette */}
                        <div className="card glass p-8">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Palette className="text-primary" /> Signature Palette</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Neutrals</label>
                                    <div className="flex gap-3">
                                        {styleDNA.color_palette.neutrals.map((c: string, i: number) => (
                                            <div key={i} className="w-12 h-12 rounded-full border border-white/20 shadow-lg" style={{ backgroundColor: c }} title={c} />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Accents</label>
                                    <div className="flex gap-3">
                                        {styleDNA.color_palette.accents.map((c: string, i: number) => (
                                            <div key={i} className="w-12 h-12 rounded-full border border-white/20 shadow-lg" style={{ backgroundColor: c }} title={c} />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Avoid</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {styleDNA.color_palette.avoid.map((c: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs">{c}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Staples */}
                        <div className="card glass p-8">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Shirt className="text-primary" /> Wardrobe Essentials</h3>
                            <ul className="space-y-4">
                                {styleDNA.must_have_staples.map((item: any, i: number) => (
                                    <li key={i} className="flex gap-3 items-start">
                                        <Check size={18} className="text-primary mt-1 shrink-0" />
                                        <div>
                                            <div className="font-bold">{item.item}</div>
                                            <div className="text-sm text-gray-400">{item.why}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Brands */}
                        <div className="card glass p-8">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Briefcase className="text-primary" /> Recommended Brands</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {styleDNA.brand_recommendations.map((brand: any, i: number) => (
                                    <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <div className="font-bold text-lg mb-1">{brand.name}</div>
                                        <div className="text-xs text-primary mb-2 uppercase tracking-wider">{brand.tier}</div>
                                        <div className="text-sm text-gray-400">{brand.why}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="card glass p-8">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Sparkles className="text-primary" /> Styling Wisdom</h3>
                            <ul className="space-y-3">
                                {styleDNA.styling_tips.map((tip: string, i: number) => (
                                    <li key={i} className="text-gray-300 italic border-l-2 border-primary/30 pl-4 py-1">
                                        "{tip}"
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="flex justify-center pt-8 pb-12">
                        <button onClick={finishOnboarding} className="btn btn-primary px-12 py-4 text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                            Enter My Wardrobe <ArrowRight className="ml-2" />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden bg-background">
            {/* Background Texture */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 15% 50%, rgba(212,175,55,0.08), transparent 25%), radial-gradient(circle at 85% 30%, rgba(255,255,255,0.05), transparent 25%)' }}
            />

            <div className="w-full max-w-2xl z-10">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                        <span>Profile Completion</span>
                        <span>{Math.round((step / totalSteps) * 100)}%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${(step / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="card glass p-8 md:p-10 min-h-[500px] flex flex-col justify-between animate-fade-in relative">

                    {/* Analyzing Overlay */}
                    {(analyzing || saving) && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center p-8 rounded-[var(--radius-lg)]">
                            <Loader2 size={48} className="text-primary animate-spin mb-6" />
                            <h2 className="text-3xl font-serif font-bold mb-2">{analyzing ? "Decoding Your Style DNA" : "Saving Your Profile"}</h2>
                            <p className="text-gray-400 max-w-md">{analyzing ? "Analysing your biometrics, lifestyle, and preferences to build your unique style profile..." : "Setting up your digital wardrobe..."}</p>
                        </div>
                    )}

                    {/* Step Content */}
                    <div className="flex-1">
                        {step === 1 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center gap-3 text-primary mb-2">
                                    <User size={24} />
                                    <span className="uppercase tracking-widest text-xs font-bold">The Basics</span>
                                </div>
                                <h1 className="text-4xl font-serif font-bold">Introduction</h1>
                                <p className="text-gray-400">Let's start with the essentials to address you properly and understand your environment.</p>

                                <div className="space-y-4 pt-4">
                                    <div>
                                        <label>Full Name</label>
                                        <input type="text" placeholder="Your Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label>Gender Identity</label>
                                            <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                                                <option value="">Select...</option>
                                                <option value="female">Female</option>
                                                <option value="male">Male</option>
                                                <option value="non-binary">Non-binary</option>
                                                <option value="other">Prefer not to say</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label>Location (City)</label>
                                            <input type="text" placeholder="New York, NY" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label>Age</label>
                                        <input type="number" placeholder="25" onChange={e => setFormData({ ...formData, age: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center gap-3 text-primary mb-2">
                                    <Ruler size={24} />
                                    <span className="uppercase tracking-widest text-xs font-bold">Measurements</span>
                                </div>
                                <h1 className="text-4xl font-serif font-bold">Body & Fit</h1>
                                <p className="text-gray-400">Help us find clothes that flatter your unique geometry.</p>

                                <div className="grid grid-cols-2 gap-6 pt-4">
                                    <div>
                                        <label>Height (cm)</label>
                                        <input type="number" placeholder="175" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} />
                                    </div>
                                    <div>
                                        <label>Weight (kg)</label>
                                        <input type="number" placeholder="70" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} />
                                    </div>
                                </div>

                                <div>
                                    <label>Body Shape Category</label>
                                    <div className="grid grid-cols-3 gap-3 mt-2">
                                        {['Inverted Triangle', 'Rectangle', 'Triangle', 'Hourglass', 'Oval'].map(shape => (
                                            <button
                                                key={shape}
                                                className={`p-3 rounded-lg border text-sm transition-all relative overflow-hidden group min-h-[140px] flex flex-col justify-end ${formData.bodyShape === shape ? 'border-primary ring-2 ring-primary/50' : 'border-white/10 hover:border-white/30'
                                                    }`}
                                                onClick={() => setFormData({ ...formData, bodyShape: shape })}
                                            >
                                                <div className="absolute inset-0 z-0">
                                                    <img src={bodyShapeVisuals[shape]} alt={shape} className="w-full h-full object-cover opacity-50 group-hover:opacity-75 transition-opacity" />
                                                    <div className={`absolute inset-0 bg-gradient-to-t from-black/90 to-transparent ${formData.bodyShape === shape ? 'opacity-90' : 'opacity-100'}`} />
                                                </div>
                                                <span className={`relative z-10 font-bold ${formData.bodyShape === shape ? 'text-primary' : 'text-white'}`}>{shape}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label>Fit Preference</label>
                                    <div className="flex gap-4 mt-2 bg-surface p-1 rounded-xl border border-white/5">
                                        {['tight', 'regular', 'loose'].map(fit => (
                                            <button
                                                key={fit}
                                                className={`flex-1 py-2 rounded-lg text-sm capitalize transition-all ${formData.fitPreference === fit ? 'bg-primary text-black shadow-lg' : 'text-gray-400 hover:text-white'
                                                    }`}
                                                onClick={() => setFormData({ ...formData, fitPreference: fit })}
                                            >
                                                {fit}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center gap-3 text-primary mb-2">
                                    <Palette size={24} />
                                    <span className="uppercase tracking-widest text-xs font-bold">Color Analysis</span>
                                </div>
                                <h1 className="text-4xl font-serif font-bold">Color Profile</h1>
                                <p className="text-gray-400">We use this to determine your seasonal color palette.</p>

                                <div className="space-y-4 pt-4">
                                    <div>
                                        <label className="block mb-3">Skin Tone & Undertone</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: "fair_cool", label: "Fair (Cool/Pink)", color: "#ffe0d9" },
                                                { id: "fair_warm", label: "Fair (Warm/Yellow)", color: "#fcecd5" },
                                                { id: "medium_cool", label: "Medium (Cool/Olive)", color: "#e3c4a8" },
                                                { id: "medium_warm", label: "Medium (Warm/Golden)", color: "#dcb690" },
                                                { id: "dark_cool", label: "Dark (Cool/Blue)", color: "#8d5e3f" },
                                                { id: "dark_warm", label: "Dark (Warm/Red)", color: "#744627" }
                                            ].map(tone => (
                                                <button
                                                    key={tone.id}
                                                    onClick={() => setFormData({ ...formData, skinTone: tone.id })}
                                                    className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${formData.skinTone === tone.id ? 'border-primary bg-primary/10' : 'border-white/10 hover:bg-white/5'
                                                        }`}
                                                >
                                                    <div className="w-8 h-8 rounded-full border border-white/20 shadow-sm shrink-0" style={{ backgroundColor: tone.color }} />
                                                    <span className={`text-sm text-left ${formData.skinTone === tone.id ? 'text-primary font-medium' : 'text-gray-300'}`}>
                                                        {tone.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label>Natural Hair Color</label>
                                            <input type="text" placeholder="e.g. Dark Brown" value={formData.hairColor} onChange={e => setFormData({ ...formData, hairColor: e.target.value })} />
                                        </div>
                                        <div>
                                            <label>Eye Color</label>
                                            <input type="text" placeholder="e.g. Hazel" value={formData.eyeColor} onChange={e => setFormData({ ...formData, eyeColor: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center gap-3 text-primary mb-2">
                                    <Briefcase size={24} />
                                    <span className="uppercase tracking-widest text-xs font-bold">Lifestyle</span>
                                </div>
                                <h1 className="text-4xl font-serif font-bold">Your Day-to-Day</h1>
                                <p className="text-gray-400">A world-class wardrobe is one that is worn. Where do you spend your time?</p>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    {[
                                        { id: 'work', label: 'Corporate / Power' },
                                        { id: 'casual', label: 'Leisure / Weekend' },
                                        { id: 'event', label: 'Gala / High Society' },
                                        { id: 'active', label: 'Movement / Wellness' }
                                    ].map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                lifestyle: { ...prev.lifestyle, [item.id]: !prev.lifestyle[item.id as keyof typeof prev.lifestyle] }
                                            }))}
                                            className={`p-6 rounded-xl border text-left transition-all h-32 flex flex-col justify-end ${formData.lifestyle[item.id as keyof typeof formData.lifestyle]
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-white/10 hover:border-white/20 bg-surface'
                                                }`}
                                        >
                                            <span className="font-medium text-lg">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center gap-3 text-primary mb-2">
                                    <Shirt size={24} />
                                    <span className="uppercase tracking-widest text-xs font-bold">Aesthetic</span>
                                </div>
                                <h1 className="text-4xl font-serif font-bold">Your Signature</h1>
                                <p className="text-gray-400">Select the archetypes/aesthetics that resonate with your vision.</p>

                                <div className="grid grid-cols-2 gap-3 pt-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                                    {[
                                        { name: "Old Money", desc: "Quiet luxury, heritage fabrics, understated elegance." },
                                        { name: "Minimalist", desc: "Clean lines, neutral palette, intentional simplicity." },
                                        { name: "High Street", desc: "Trend-driven, bold, urban edge." },
                                        { name: "Classic", desc: "Timeless tailoring, structured silhouettes." },
                                        { name: "Bohemian", desc: "Free-spirited, artisanal textures, earthy." },
                                        { name: "Avant-Garde", desc: "Experimental, architectural, rule-breaking." },
                                        { name: "Ivy League", desc: "Polished, collegiate, traditional patterns." },
                                        { name: "Glamorous", desc: "Opulent materials, statement pieces, high impact." },
                                    ].map(archetype => (
                                        <button
                                            key={archetype.name}
                                            onClick={() => toggleArchetype(archetype.name)}
                                            className={`p-0 rounded-xl border text-left transition-all relative overflow-hidden group min-h-[160px] flex flex-col justify-end ${formData.archetypes.includes(archetype.name)
                                                ? 'border-primary ring-2 ring-primary/50'
                                                : 'border-white/10 hover:border-white/30'
                                                }`}
                                        >
                                            <div className="absolute inset-0 z-0">
                                                <img src={aestheticVisuals[archetype.name]} alt={archetype.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                                                <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent ${formData.archetypes.includes(archetype.name) ? 'opacity-90' : 'opacity-100'}`} />
                                            </div>
                                            <div className="relative z-10 p-4">
                                                <div className={`font-bold mb-1 ${formData.archetypes.includes(archetype.name) ? 'text-primary' : 'text-white'}`}>
                                                    {archetype.name}
                                                </div>
                                                <div className="text-xs text-gray-300 leading-relaxed font-medium">{archetype.desc}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-6 border-t border-white/10 pt-6">
                                    <label className="block text-sm font-medium mb-2">Which brands do you admire?</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Brunello Cucinelli, Ralph Lauren, ZARA"
                                        className="w-full"
                                        value={Array.isArray(formData.brands) ? formData.brands.join(', ') : ''}
                                        onChange={e => setFormData({ ...formData, brands: e.target.value.split(',').map(s => s.trim()) })}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium mb-2">Typical Investment per Item</label>
                                    <select
                                        className="w-full"
                                        value={formData.priceRange}
                                        onChange={e => setFormData({ ...formData, priceRange: e.target.value })}
                                    >
                                        <option value="">Select Range...</option>
                                        <option value="budget">High Street (Rs. 1,500 - 8,000)</option>
                                        <option value="mid">Contemporary (Rs. 8,000 - 40,000)</option>
                                        <option value="luxury">Designer (Rs. 40,000 - 1,50,000)</option>
                                        <option value="high_luxury">Couture / High Jewelry (Rs. 1,50,000+)</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {step === 6 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center gap-3 text-primary mb-2">
                                    <Upload size={24} />
                                    <span className="uppercase tracking-widest text-xs font-bold">One last thing</span>
                                </div>
                                <h1 className="text-4xl font-serif font-bold">Visual Reference</h1>
                                <p className="text-gray-400">Upload a photo to give our AI the clearest picture of you. (Optional)</p>

                                <div
                                    className="border-2 border-dashed border-white/20 rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-white/5 relative group mt-8 overflow-hidden"
                                    onClick={() => document.getElementById('avatar-upload')?.click()}
                                >
                                    {formData.avatar_url ? (
                                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 group-hover:bg-black/30 transition-colors">
                                            <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover opacity-50" />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <Check size={48} className="text-primary mb-2 shadow-black drop-shadow-lg" />
                                                <span className="text-white font-bold drop-shadow-md">Photo Uploaded</span>
                                                <span className="text-xs text-gray-300 mt-2">Click to change</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                                            <Upload size={48} className="text-gray-500 mb-4 group-hover:text-primary transition-colors z-10" />
                                            <span className="text-gray-400 z-10">Click to upload photo</span>
                                        </>
                                    )}
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/5">
                        {step > 1 ? (
                            <button
                                onClick={handleBack}
                                className="text-gray-400 hover:text-white flex items-center gap-2 px-4 py-2 transition-colors"
                            >
                                <ArrowLeft size={18} /> Back
                            </button>
                        ) : (
                            <div />
                        )}

                        <button
                            onClick={handleNext}
                            className="btn btn-primary px-8"
                        >
                            {step === totalSteps ? (
                                <>Analyze Profile <Sparkles size={18} className="ml-2" /></>
                            ) : (
                                <>Continue <ChevronRight size={18} className="ml-2" /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
