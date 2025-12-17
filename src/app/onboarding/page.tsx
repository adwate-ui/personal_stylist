"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, ChevronRight, Check, ArrowLeft, Ruler, Palette, Briefcase, Sparkles, User, Shirt } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

export default function Onboarding() {
    const router = useRouter();
    const { saveProfile } = useProfile();
    const [step, setStep] = useState(1);
    const [analyzing, setAnalyzing] = useState(false);

    // Initialize with local state, we'll save to global state at the end
    const [formData, setFormData] = useState({
        // Basics
        name: "",
        gender: "",
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
        brands: "" as string | string[], // Handle as string for input
        priceRange: "",
        avatar: null as File | null,
    });

    const totalSteps = 6;

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            finishOnboarding();
        }
    };

    const handleBack = () => setStep(step - 1);

    const finishOnboarding = async () => {
        setAnalyzing(true);
        // Simulate Gemini generating "Style DNA"
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Persist data
        saveProfile(formData);

        router.push("/wardrobe");
    };

    const toggleArchetype = (style: string) => {
        setFormData(prev => ({
            ...prev,
            archetypes: prev.archetypes.includes(style)
                ? prev.archetypes.filter(s => s !== style)
                : [...prev.archetypes, style]
        }));
    };

    const archetypes = [
        { name: "Minimalist", desc: "Clean lines, neutral colors, functional." },
        { name: "Streetwear", desc: "Urban, comfortable, bold graphics." },
        { name: "Classic", desc: "Timeless pieces, tailored fits, structured." },
        { name: "Bohemian", desc: "Free-spirited, flowy fabrics, earthy tones." },
        { name: "Avant-Garde", desc: "Experimental, unconventional silhouettes." },
        { name: "Preppy", desc: "Polished, collegiate, traditional patterns." },
        { name: "Glamorous", desc: "Luxe fabrics, sparkles, statement pieces." },
        { name: "Rugged", desc: "Durable materials, outdoorsy, practical." },
    ];

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
                    {analyzing && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center p-8 rounded-[var(--radius-lg)]">
                            <Sparkles size={48} className="text-primary animate-pulse mb-6" />
                            <h2 className="text-3xl font-serif font-bold mb-2">Generating Style DNA</h2>
                            <p className="text-gray-400 max-w-md">Gemini is analyzing your inputs to create a hyper-personalized style profile...</p>
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
                                                className={`p-3 rounded-lg border text-sm transition-all ${formData.bodyShape === shape ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 hover:border-white/30'
                                                    }`}
                                                onClick={() => setFormData({ ...formData, bodyShape: shape })}
                                            >
                                                {shape}
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
                                        <label>Skin Tone & Undertone</label>
                                        <select value={formData.skinTone} onChange={e => setFormData({ ...formData, skinTone: e.target.value })}>
                                            <option value="">Select...</option>
                                            <option value="fair_cool">Fair (Cool/Pink)</option>
                                            <option value="fair_warm">Fair (Warm/Yellow)</option>
                                            <option value="medium_cool">Medium (Cool/Olive)</option>
                                            <option value="medium_warm">Medium (Warm/Golden)</option>
                                            <option value="dark_cool">Dark (Cool/Blue)</option>
                                            <option value="dark_warm">Dark (Warm/Red)</option>
                                        </select>
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
                                <p className="text-gray-400">Select the archetypes that resonate with your vision.</p>

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
                                            className={`p-4 rounded-xl border text-left transition-all ${formData.archetypes.includes(archetype.name)
                                                ? 'border-primary bg-primary/10'
                                                : 'border-white/10 hover:bg-white/5'
                                                }`}
                                        >
                                            <div className={`font-bold mb-1 ${formData.archetypes.includes(archetype.name) ? 'text-primary' : 'text-white'}`}>
                                                {archetype.name}
                                            </div>
                                            <div className="text-xs text-gray-400 leading-relaxed">{archetype.desc}</div>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-6 border-t border-white/10 pt-6">
                                    <label className="block text-sm font-medium mb-2">Which brands do you admire?</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Brunello Cucinelli, Ralph Lauren, ZARA"
                                        className="w-full"
                                        value={formData.brands}
                                        onChange={e => setFormData({ ...formData, brands: e.target.value.split(',') })} // Simple CSV handling
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
                                        <option value="budget">High Street ($20 - $100)</option>
                                        <option value="mid">Contemporary ($100 - $500)</option>
                                        <option value="luxury">Designer ($500 - $2000)</option>
                                        <option value="high_luxury">Couture / High Jewelry ($2000+)</option>
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

                                <div className="border-2 border-dashed border-white/20 rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-white/5 relative group mt-8">
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                                    <Upload size={48} className="text-gray-500 mb-4 group-hover:text-primary transition-colors z-10" />
                                    <span className="text-gray-400 z-10">Click to upload photo</span>
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
