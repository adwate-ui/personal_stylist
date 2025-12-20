"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Upload, ChevronRight, Check, ArrowLeft, ArrowRight, Ruler, Palette, Briefcase, Sparkles, User, Shirt, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { generateStyleDNAWithAI, StyleDNA } from "@/lib/style-dna-generator";
import validCities from "@/data/cities";
import { toast } from "sonner";

// Body shape visual mapping - professional images
const bodyShapeVisuals: { [key: string]: string } = {
    'Rectangle': '/body-shapes/rectangle.png',
    'Inverted Triangle': '/body-shapes/inverted-triangle.png',
    'Triangle': '/body-shapes/triangle.png',
    'Pear': '/body-shapes/triangle.png',
    'Hourglass': '/body-shapes/hourglass.png',
    'Oval': '/body-shapes/oval.png',
    'Apple': '/body-shapes/oval.png',
    'Trapezoid': '/body-shapes/inverted-triangle.png',
    'Athletic': '/body-shapes/athletic.png',
    'Balanced': '/body-shapes/rectangle.png',
    'Top-Heavy': '/body-shapes/inverted-triangle.png',
    'Bottom-Heavy': '/body-shapes/triangle.png',
    'Straight': '/body-shapes/rectangle.png',
    'Rounded': '/body-shapes/oval.png'
};

function OnboardingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode'); // 'preferences' for returning users, 'regenerate' for regenerating Style DNA
    const [avatarPreview, setAvatarPreview] = useState<string>("");
    const { profile, saveProfile, loading: profileLoading } = useProfile();
    const [step, setStep] = useState(mode === 'preferences' ? 2 : 1); // Skip basics if from preferences
    const [analyzing, setAnalyzing] = useState(false);
    const [styleDNA, setStyleDNA] = useState<StyleDNA | null>(null);
    const [saving, setSaving] = useState(false);
    const [cityError, setCityError] = useState<string>("");
    const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
    const [showCitySuggestions, setShowCitySuggestions] = useState(false);

    // Initialize with local state, we'll save to global state at the end
    const [geminiApiKey, setGeminiApiKey] = useState("");
    const [showApiKeyInput, setShowApiKeyInput] = useState(false);
    const [skinToneBase, setSkinToneBase] = useState("");
    const [skinToneUndertone, setSkinToneUndertone] = useState("");
    const [showMeasurementCalc, setShowMeasurementCalc] = useState(false);
    const [measurements, setMeasurements] = useState({ shoulders: '', chest: '', waist: '', hips: '' });

    const [formData, setFormData] = useState({
        // Basics
        name: "",
        gender: "",
        age: "",
        location: "", // Climate context
        gemini_api_key: "",

        // Body
        height: "",
        weight: "",
        bodyShape: "", // e.g. Rectangle, Triangle, Hourglass
        fitPreference: "regular", // tight, regular, loose

        // Color
        skinTone: "",
        skinToneUndertone: "",
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

    // Major global cities for validation
    const validCities = [
        // India
        'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
        'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Gurgaon', 'Noida',
        // North America
        'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
        'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'San Francisco', 'Seattle',
        'Denver', 'Washington DC', 'Boston', 'Portland', 'Las Vegas', 'Miami', 'Atlanta',
        'Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Mexico City', 'Guadalajara',
        // Europe
        'London', 'Paris', 'Berlin', 'Madrid', 'Rome', 'Barcelona', 'Vienna', 'Amsterdam',
        'Brussels', 'Copenhagen', 'Stockholm', 'Oslo', 'Helsinki', 'Dublin', 'Lisbon',
        'Prague', 'Budapest', 'Warsaw', 'Athens', 'Zurich', 'Geneva', 'Munich', 'Hamburg',
        'Milan', 'Naples', 'Turin', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow',
        // Asia
        'Tokyo', 'Shanghai', 'Beijing', 'Singapore', 'Hong Kong', 'Seoul', 'Bangkok',
        'Kuala Lumpur', 'Manila', 'Jakarta', 'Ho Chi Minh City', 'Hanoi', 'Taipei', 'Dubai',
        'Abu Dhabi', 'Riyadh', 'Tel Aviv', 'Istanbul', 'Ankara', 'Tehran', 'Baghdad',
        // Oceania
        'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Auckland', 'Wellington', 'Adelaide',
        // South America
        'São Paulo', 'Rio de Janeiro', 'Buenos Aires', 'Lima', 'Bogotá', 'Santiago',
        'Caracas', 'Brasília', 'Montevideo', 'Quito',
        // Africa
        'Cairo', 'Lagos', 'Johannesburg', 'Cape Town', 'Nairobi', 'Casablanca', 'Accra',
        'Addis Ababa', 'Dar es Salaam', 'Algiers', 'Khartoum', 'Tunis'
    ];

    const bodyShapeVisuals: Record<string, string> = {
        // Women's body shapes
        'Hourglass': '/body_shape_hourglass_1766144787860.png',
        'Rectangle': '/body_shape_rectangle_1766144804765.png',
        'Pear': '/body_shape_pear_1766144822050.png',
        'Inverted Triangle': '/body_shape_inverted_triangle_f_1766144838895.png',
        'Apple': '/body_shape_apple_1766144855874.png',
        // Men's body shapes
        'Triangle': '/body_shape_triangle_m_1766144882748.png',
        'Oval': '/body_shape_oval_m_1766144932373.png',
        'Trapezoid': '/body_shape_trapezoid_m_1766144949305.png'
    };

    const aestheticVisuals: Record<string, string> = {
        'Old Money': 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=500&auto=format&fit=crop&q=80',
        'Minimalist': 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=80',
        'High Street': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop&q=80',
        'Classic': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&auto=format&fit=crop&q=80',
        'Bohemian': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=80',
        'Avant-Garde': 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&auto=format&fit=crop&q=80',
        'Ivy League': 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500&auto=format&fit=crop&q=80',
        'Glamorous': 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500&auto=format&fit=crop&q=80'
    };

    const totalSteps = 6;

    // Check if returning user and redirect to wardrobe
    useEffect(() => {
        if (!profileLoading && mode !== 'preferences' && mode !== 'regenerate') {
            // If user has Style DNA, they've completed onboarding
            if (profile.styleDNA) {
                router.push('/wardrobe');
                return;
            }
        }
    }, [profileLoading, profile, mode, router]);

    // Load saved form data from localStorage on mount
    useEffect(() => {
        if ((mode === 'preferences' || mode === 'regenerate') && !profileLoading) {
            // Load existing profile data for preferences or regenerate mode
            setFormData(prev => ({
                ...prev,
                ...profile,
                // Convert to expected format
                brands: Array.isArray(profile.brands) ? profile.brands : [],
                archetypes: Array.isArray(profile.archetypes) ? profile.archetypes : []
            }));
            if (profile.avatar_url) {
                setAvatarPreview(profile.avatar_url);
            }

            // Auto-trigger Style DNA generation for regenerate mode
            if (mode === 'regenerate' && profile && !analyzing && !styleDNA) {
                console.log('🔄 Regenerate mode detected - auto-generating Style DNA');
                setAnalyzing(true);
                setTimeout(() => {
                    generateDNA();
                }, 500); // Small delay to ensure data is loaded
            }
        } else {
            const saved = localStorage.getItem('onboarding_draft');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setFormData(parsed);
                    if (parsed.avatar_url) {
                        setAvatarPreview(parsed.avatar_url);
                    }
                } catch (e) {
                    console.error('Failed to parse saved onboarding data');
                }
            }
        }
    }, [mode, profileLoading, profile]);

    // Save form data to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('onboarding_draft', JSON.stringify(formData));
    }, [formData]);

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            generateDNA();
        }
    };

    const handleBack = () => setStep(step - 1);




    // Calculate body shape from measurements
    const calculateBodyShape = () => {
        const { shoulders, chest, waist, hips } = measurements;
        if (!shoulders || !chest || !waist || !hips) {
            alert('Please enter all measurements');
            return;
        }

        const s = parseFloat(shoulders);
        const c = parseFloat(chest);
        const w = parseFloat(waist);
        const h = parseFloat(hips);

        let shape = '';

        if (formData.gender === 'male') {
            // Male body shapes
            const shoulderHipRatio = s / h;
            const waistHipRatio = w / h;

            if (shoulderHipRatio > 1.05 && waistHipRatio < 0.9) {
                shape = 'Inverted Triangle'; // Broad shoulders, narrow hips
            } else if (shoulderHipRatio < 0.95 && waistHipRatio > 0.95) {
                shape = 'Triangle'; // Narrow shoulders, wider hips
            } else if (Math.abs(shoulderHipRatio - 1) < 0.05 && Math.abs(waistHipRatio - 1) < 0.05) {
                shape = 'Rectangle'; // Equal proportions
            } else if (w > s && w > h) {
                shape = 'Oval'; // Rounded midsection
            } else {
                shape = 'Trapezoid'; // Ideal V-shape
            }
        } else if (formData.gender === 'female') {
            // Female body shapes
            const bustHipRatio = c / h;
            const waistHipRatio = w / h;

            if (Math.abs(bustHipRatio - 1) < 0.1 && waistHipRatio < 0.75) {
                shape = 'Hourglass'; // Balanced with defined waist
            } else if (Math.abs(bustHipRatio - 1) < 0.1 && waistHipRatio > 0.8) {
                shape = 'Rectangle'; // Straight figure
            } else if (bustHipRatio < 0.9) {
                shape = 'Pear'; // Hips wider than bust
            } else if (bustHipRatio > 1.1) {
                shape = 'Inverted Triangle'; // Shoulders broader
            } else if (waistHipRatio > 0.85) {
                shape = 'Apple'; // Fuller middle
            } else {
                shape = 'Rectangle';
            }
        }

        setFormData({ ...formData, bodyShape: shape });
        setShowMeasurementCalc(false);
        alert(`Based on your measurements, your body shape is: ${shape} `);
    };

    // City autocomplete handler
    const handleCityInput = (value: string) => {
        setFormData({ ...formData, location: value });
        if (cityError) setCityError("");

        // Show suggestions after 3 characters
        if (value.length >= 3) {
            const filtered = validCities.filter(city =>
                city.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 15); // Limit to top 15 matches
            setCitySuggestions(filtered);
            setShowCitySuggestions(filtered.length > 0);
        } else {
            setShowCitySuggestions(false);
            setCitySuggestions([]);
        }
    };

    const selectCity = (city: string) => {
        setFormData({ ...formData, location: city });
        setShowCitySuggestions(false);
        setCitySuggestions([]);
        setCityError("");
    };

    // ... inside component ...

    const validateCity = (city: string): boolean => {
        if (!city.trim()) {
            setCityError("City is required");
            return false;
        }
        const normalized = city.trim();
        const isValid = validCities.some(c =>
            c.toLowerCase() === normalized.toLowerCase()
        );
        if (!isValid) {
            setCityError("Please select a city from the suggestions");
            return false;
        }
        setCityError("");
        return true;
    };

    const generateDNA = async () => {
        setAnalyzing(true);

        try {
            // Get API key from formData, profile, or localStorage
            const apiKey = formData.gemini_api_key || profile.gemini_api_key || localStorage.getItem('gemini_api_key') || '';

            if (!apiKey) {
                alert('Please add your Gemini API key in Step 1 to generate Style DNA, or add it later in Settings.');
                setAnalyzing(false);
                return;
            }

            const dna = await generateStyleDNAWithAI(formData, apiKey);
            setStyleDNA(dna);
        } catch (error: any) {
            console.error("DNA Generation Error:", error);
            alert(error.message || "Failed to generate Style DNA. Please try again.");
            setAnalyzing(false);
        } finally {
            setAnalyzing(false);
        }
    };

    const finishOnboarding = async () => {
        setSaving(true);
        try {
            // Direct Supabase save (Client-Side)
            // Note: server-side API is disabled in static build
            await saveProfile({ ...formData, styleDNA });
            localStorage.removeItem('onboarding_draft');
            router.push("/wardrobe");
        } catch (error) {
            console.error("Profile Save Error:", error);
            alert("Failed to save profile. Please check your connection.");
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

        if (!isSupabaseConfigured) {
            alert('Avatar upload is not available at this time. Please skip this step and continue with onboarding.');
            return;
        }

        console.log('🖼️ Avatar upload started...');
        setAnalyzing(true);
        try {
            const file = e.target.files[0];
            console.log('📁 File selected:', file.name, file.size, 'bytes');

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = fileName;

            console.log('⬆️ Uploading to Supabase:', filePath);

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                console.error('❌ Upload error:', uploadError);
                throw uploadError;
            }

            console.log('✅ Upload successful!');

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            const avatarUrl = data.publicUrl;

            console.log('🔗 Public URL:', avatarUrl);
            console.log('📝 Setting avatarPreview:', avatarUrl);

            setAvatarPreview(avatarUrl);
            setFormData(prev => {
                const updated = { ...prev, avatar_url: avatarUrl.trim() };
                console.log('💾 Updated formData:', updated.avatar_url);
                return updated;
            });

            console.log('✨ Avatar preview should now be visible');
        } catch (error) {
            console.error('💥 Avatar upload error:', error);
            alert(`Error uploading avatar: ${error instanceof Error ? error.message : 'Unknown error'} `);
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

                        {/* Model Attribution */}
                        {styleDNA.generated_by_model && (
                            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm">
                                <span className="text-gray-400">Generated by:</span>
                                <span className="text-primary font-medium">
                                    {styleDNA.generated_by_model === 'gemini-3-pro-preview' && 'Gemini 3 Pro Preview'}
                                    {styleDNA.generated_by_model === 'gemini-2.5-pro' && 'Gemini 2.5 Pro'}
                                    {styleDNA.generated_by_model === 'gemini-3-flash-preview' && 'Gemini 3 Flash Preview'}
                                    {styleDNA.generated_by_model === 'gemini-2.5-flash' && 'Gemini 2.5 Flash'}
                                    {!['gemini-3-pro-preview', 'gemini-2.5-pro', 'gemini-3-flash-preview', 'gemini-2.5-flash'].includes(styleDNA.generated_by_model) && styleDNA.generated_by_model}
                                </span>
                                <a
                                    href="/onboarding?mode=regenerate"
                                    className="ml-2 text-xs px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-full transition-colors"
                                >
                                    Regenerate ↻
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                                {styleDNA.color_palette.rationale && (
                                    <div className="pt-4 border-t border-white/10">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Why These Colors?</label>
                                        <p className="text-sm text-gray-300 italic">{styleDNA.color_palette.rationale}</p>
                                    </div>
                                )}
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Avoid</label>
                                    <div className="space-y-2">
                                        {styleDNA.color_palette.avoid.map((item: { color: string; reason: string }, i: number) => (
                                            <div key={i} className="flex items-center gap-3 bg-white/5 p-2 rounded-lg">
                                                <div className="relative">
                                                    <div className="w-10 h-10 rounded-lg border border-white/20 shadow-lg" style={{ backgroundColor: item.color }} />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-white text-xl font-bold drop-shadow-lg">×</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-white">{item.color}</div>
                                                    <div className="text-xs text-gray-400 mt-0.5">{item.reason}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Staples */}
                        <div className="card glass p-8">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Shirt className="text-primary" /> Wardrobe Essentials</h3>
                            <div className="space-y-6">
                                {Object.entries(styleDNA.must_have_staples).map(([category, types]) => (
                                    <div key={category}>
                                        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 border-b border-white/10 pb-2">
                                            {category.replace(/_/g, ' ')}
                                        </h4>
                                        {Object.entries(types as Record<string, Array<{ item: string; brand: string; why: string; product_url: string }>>).map(([type, items]) => (
                                            <div key={type} className="mb-4">
                                                <h5 className="text-xs text-gray-500 uppercase tracking-wider mb-2">{type.replace(/_/g, ' ')}</h5>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                    {items.map((item: { item: string; brand: string; why: string; product_url: string }, i: number) => (
                                                        <div key={i} className="flex gap-3 items-start bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors">
                                                            <Check size={18} className="text-primary mt-1 shrink-0" />
                                                            <div className="flex-1">
                                                                <div className="font-bold">{item.item}</div>
                                                                <div className="text-xs text-primary">@ {item.brand}</div>
                                                                <div className="text-sm text-gray-400 mt-1">{item.why}</div>
                                                                <a
                                                                    href={item.product_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs text-primary hover:underline mt-1 inline-block"
                                                                >
                                                                    Shop Now →
                                                                </a>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Brands */}
                        <div className="card glass p-8">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Briefcase className="text-primary" /> Recommended Brands</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {styleDNA.brand_recommendations.map((brand, i) => (
                                    <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <div className="font-bold text-lg mb-1">{brand.name}</div>
                                        <div className="text-xs text-primary mb-2 uppercase tracking-wider">{brand.tier}</div>
                                        <div className="text-sm text-gray-400">{brand.why}</div>
                                    </div>
                                ))}
                            </div>
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
                            style={{ width: `${(step / totalSteps) * 100}% ` }}
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
                        {step === 1 && mode !== 'preferences' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center gap-3 text-primary mb-2">
                                    <User size={24} />
                                    <span className="uppercase tracking-widest text-xs font-bold">The Basics</span>
                                </div>
                                <h1 className="text-4xl font-serif font-bold">Introduction</h1>
                                <p className="text-gray-400">Let&apos;s start with the essentials to address you properly and understand your environment.</p>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <label className="block text-sm font-medium">Full Name</label>
                                        <input type="text" placeholder="Your Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium">Gender Identity</label>
                                            <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full">
                                                <option value="">Select...</option>
                                                <option value="female">Female</option>
                                                <option value="male">Male</option>
                                                <option value="non-binary">Non-binary</option>
                                                <option value="other">Prefer not to say</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2 relative">
                                            <label className="block text-sm font-medium">City</label>
                                            <input
                                                type="text"
                                                placeholder="Start typing (e.g., Mumbai, Bangalore, Delhi)"
                                                value={formData.location}
                                                onChange={e => handleCityInput(e.target.value)}
                                                onBlur={() => {
                                                    // Delay hiding to allow click on suggestion
                                                    setTimeout(() => {
                                                        setShowCitySuggestions(false);
                                                        validateCity(formData.location);
                                                    }, 200);
                                                }}
                                                onFocus={() => {
                                                    if (formData.location.length >= 3 && citySuggestions.length > 0) {
                                                        setShowCitySuggestions(true);
                                                    }
                                                }}
                                                className={`w-full px-4 py-3 bg-white/5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${cityError ? 'border-red-500 focus:ring-red-500' : 'border-white/10'} `}
                                                autoComplete="off"
                                            />

                                            {/* Autocomplete Dropdown */}
                                            {showCitySuggestions && citySuggestions.length > 0 && (
                                                <div className="absolute z-50 w-full mt-1 bg-surface border border-white/20 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                                                    {citySuggestions.slice(0, 10).map(city => (
                                                        <button
                                                            key={city}
                                                            type="button"
                                                            className="w-full text-left px-4 py-2 hover:bg-primary/10 hover:text-primary transition-colors text-sm border-b border-white/5 last:border-0"
                                                            onMouseDown={() => selectCity(city)}
                                                        >
                                                            {city}
                                                        </button>
                                                    ))}
                                                    {citySuggestions.length > 10 && (
                                                        <div className="px-4 py-2 text-xs text-gray-500 text-center">
                                                            ...and {citySuggestions.length - 10} more
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {cityError && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><span>⚠️</span>{cityError}</p>}
                                            {!cityError && formData.location.length > 0 && formData.location.length < 3 && (
                                                <p className="text-gray-500 text-xs mt-1">Type at least 3 characters to see suggestions</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium">Age</label>
                                        <input
                                            type="number"
                                            placeholder="25"
                                            value={formData.age}
                                            onChange={e => setFormData({ ...formData, age: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none"
                                        />
                                    </div>
                                </div>

                                {/* Gemini API Key Input */}
                                <div className="mt-8 p-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl">
                                    <div className="flex items-start gap-3 mb-4">
                                        <Sparkles className="text-primary mt-1" size={24} />
                                        <div>
                                            <h4 className="font-bold text-lg">AI-Powered Style DNA</h4>
                                            <p className="text-sm text-gray-300">Add your Gemini API key to unlock personalized style recommendations</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium">Gemini API Key (Optional)</label>
                                        <input
                                            type="password"
                                            placeholder="Enter your Gemini API key"
                                            value={formData.gemini_api_key}
                                            onChange={e => setFormData({ ...formData, gemini_api_key: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                        />
                                        <p className="text-xs text-gray-400">
                                            Don't have one? <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Get your free API key here →</a>
                                        </p>
                                        <p className="text-xs text-gray-500 italic">You can also add this later from Settings</p>
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

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium">Height (cm)</label>
                                        <input
                                            type="number"
                                            placeholder="175"
                                            value={formData.height}
                                            onChange={e => setFormData({ ...formData, height: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none" // Remove spinner
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium">Weight (kg)</label>
                                        <input
                                            type="number"
                                            placeholder="70"
                                            value={formData.weight}
                                            onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                            className="appearance-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-base font-semibold">Body Shape</label>
                                        <button
                                            type="button"
                                            className="text-xs text-primary hover:underline flex items-center gap-1"
                                            onClick={() => setShowMeasurementCalc(true)}
                                        >
                                            <Ruler size={14} />
                                            Measurement guide
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {(formData.gender === 'male' ? [
                                            { name: 'Triangle', desc: 'Wider waist/hips', icon: '🔻' },
                                            { name: 'Inverted Triangle', desc: 'Broad shoulders', icon: '🔺' },
                                            { name: 'Rectangle', desc: 'Equal proportions', icon: '⬜' },
                                            { name: 'Oval', desc: 'Rounded center', icon: '⭕' },
                                            { name: 'Trapezoid', desc: 'Ideal V-shape', icon: '🔶' }
                                        ] : formData.gender === 'female' ? [
                                            { name: 'Hourglass', desc: 'Defined waist', icon: '⌛' },
                                            { name: 'Rectangle', desc: 'Straight figure', icon: '⬜' },
                                            { name: 'Pear', desc: 'Wider hips', icon: '🍐' },
                                            { name: 'Inverted Triangle', desc: 'Broad shoulders', icon: '🔺' },
                                            { name: 'Apple', desc: 'Fuller middle', icon: '🍎' }
                                        ] : [
                                            { name: 'Balanced', desc: 'Proportionate', icon: '⚖️' },
                                            { name: 'Top-Heavy', desc: 'Broader upper', icon: '🔺' },
                                            { name: 'Bottom-Heavy', desc: 'Wider lower', icon: '🔻' },
                                            { name: 'Straight', desc: 'Even shape', icon: '⬜' },
                                            { name: 'Rounded', desc: 'Fuller frame', icon: '⭕' }
                                        ]).map(shape => (
                                            <button
                                                key={shape.name}
                                                type="button"
                                                className={`p-3 rounded-lg border text-left transition-all ${formData.bodyShape === shape.name ? 'border-primary bg-primary/10 ring-1 ring-primary/50' : 'border-white/10 hover:border-white/30 hover:bg-white/5'} `}
                                                onClick={() => setFormData({ ...formData, bodyShape: shape.name })}
                                            >
                                                <div className="text-center mb-2">
                                                    {bodyShapeVisuals[shape.name] ? (
                                                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-white/5 to-white/10 rounded-lg p-2 border border-white/10">
                                                            <img
                                                                src={bodyShapeVisuals[shape.name]}
                                                                alt={shape.name}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="text-3xl mb-1">{shape.icon || '👤'}</div>
                                                    )}
                                                </div>
                                                <div className="flex items-start justify-between mb-1">
                                                    <span className={`font - semibold text-sm ${formData.bodyShape === shape.name ? 'text-primary' : 'text-white'} `}>{shape.name}</span>
                                                    {formData.bodyShape === shape.name && <Check size={16} className="text-primary shrink-0" />}
                                                </div>
                                                <p className="text-xs text-gray-400">{shape.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                    {!formData.gender && (
                                        <p className="text-xs text-yellow-400/80 mt-2 flex items-center gap-1">
                                            <span>⚠️</span>
                                            Select gender above for specific body shapes
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label>Fit Preference</label>
                                    <div className="flex gap-4 mt-2 bg-surface p-1 rounded-xl border border-white/5">
                                        {['tight', 'regular', 'loose'].map(fit => (
                                            <button
                                                key={fit}
                                                className={`flex - 1 py-2 rounded-lg text-sm capitalize transition-all ${formData.fitPreference === fit ? 'bg-primary text-black shadow-lg' : 'text-gray-400 hover:text-white'
                                                    } `}
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

                                <div className="space-y-6 pt-4">
                                    {/* Skin Tone - 12-Tone System */}
                                    <div className="space-y-4">
                                        <label className="block text-base font-semibold">Skin Tone & Undertone</label>

                                        {/* Step 1: Base Skin Tone */}
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-400">1. Select your base skin tone:</p>
                                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                                {[
                                                    { id: 'very_fair', label: 'Very Fair', color: '#fef5e7' },
                                                    { id: 'fair', label: 'Fair', color: '#f8e1d0' },
                                                    { id: 'light', label: 'Light', color: '#e8c8a9' },
                                                    { id: 'medium', label: 'Medium', color: '#d4a574' },
                                                    { id: 'tan', label: 'Tan', color: '#b8825f' },
                                                    { id: 'deep', label: 'Deep', color: '#7a5347' }
                                                ].map(tone => (
                                                    <button
                                                        key={tone.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSkinToneBase(tone.id);
                                                            // Combine base + undertone if undertone selected
                                                            if (skinToneUndertone) {
                                                                setFormData({ ...formData, skinTone: `${tone.id}_${skinToneUndertone} `, skinToneUndertone });
                                                            }
                                                        }}
                                                        className={`p-2 rounded-lg border text-center transition-all ${skinToneBase === tone.id ? 'border-primary ring-2 ring-primary/50' : 'border-white/10 hover:border-white/30'} `}
                                                    >
                                                        <div
                                                            className="w-full h-12 rounded mb-1"
                                                            style={{ backgroundColor: tone.color }}
                                                        />
                                                        <span className={`text - xs font-medium ${skinToneBase === tone.id ? 'text-primary' : 'text-gray-300'} `}>{tone.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Step 2: Undertone */}
                                        {skinToneBase && (
                                            <div className="space-y-2 animate-fade-in">
                                                <p className="text-sm text-gray-400">2. Select your undertone:</p>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                    {[
                                                        { id: 'cool', label: 'Cool', desc: 'Pink/blue tones', color: '#FFB6C1' },
                                                        { id: 'warm', label: 'Warm', desc: 'Golden tones', color: '#FFD700' },
                                                        { id: 'neutral', label: 'Neutral', desc: 'Balanced tones', color: '#D2B48C' },
                                                        { id: 'olive', label: 'Olive', desc: 'Greenish tones', color: '#90A955' }
                                                    ].map(undertone => (
                                                        <button
                                                            key={undertone.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSkinToneUndertone(undertone.id);
                                                                setFormData({
                                                                    ...formData,
                                                                    skinTone: `${skinToneBase}_${undertone.id} `,
                                                                    skinToneUndertone: undertone.id
                                                                });
                                                            }}
                                                            className={`p-3 rounded-lg border text-left transition-all ${skinToneUndertone === undertone.id ? 'border-primary bg-primary/10' : 'border-white/10 hover:bg-white/5'} `}
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div
                                                                    className="w-8 h-8 rounded-full border-2 border-white/20"
                                                                    style={{ backgroundColor: undertone.color }}
                                                                />
                                                                <div className="flex-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className={`font - semibold text-sm ${skinToneUndertone === undertone.id ? 'text-primary' : 'text-white'} `}>{undertone.label}</span>
                                                                        {skinToneUndertone === undertone.id && <Check size={14} className="text-primary" />}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-gray-400">{undertone.desc}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Selected Combination */}
                                        {formData.skinTone && (
                                            <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 p-3 rounded-lg">
                                                <Check size={16} />
                                                <span>Selected: {formData.skinTone.replace('_', ' - ')}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Hair and Eye Colors - Better Spacing */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-base font-semibold mb-3">Hair Color</label>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {[
                                                    { name: 'Black', color: '#1a1a1a' },
                                                    { name: 'Dark Brown', color: '#3d2817' },
                                                    { name: 'Light Brown', color: '#6f4e37' },
                                                    { name: 'Blonde', color: '#e6c287' },
                                                    { name: 'Red', color: '#8b3103' },
                                                    { name: 'Auburn', color: '#a52a2a' },
                                                    { name: 'Grey', color: '#c0c0c0' }
                                                ].map(hair => (
                                                    <button
                                                        key={hair.name}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, hairColor: hair.name })}
                                                        className={`flex flex-col items-center gap - 1 p - 2 rounded-lg border transition-all ${formData.hairColor === hair.name ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/30'} `}
                                                    >
                                                        <div
                                                            className="w-10 h-10 rounded-full border-2 border-white/20"
                                                            style={{ backgroundColor: hair.color }}
                                                        />
                                                        <span className="text-[10px] text-center leading-tight">{hair.name}</span>
                                                        {formData.hairColor === hair.name && <Check size={12} className="text-primary" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <label className="block text-lg font-bold">Style Archetypes (Select 1-3)</label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {[
                                                    { name: 'Brown', color: '#5C4033' },
                                                    { name: 'Hazel', color: '#8E7618' },
                                                    { name: 'Blue', color: '#5FA8D3' },
                                                    { name: 'Green', color: '#50C878' },
                                                    { name: 'Grey', color: '#A9A9A9' },
                                                    { name: 'Amber', color: '#FFBF00' }
                                                ].map(eye => (
                                                    <button
                                                        key={eye.name}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, eyeColor: eye.name })}
                                                        className={`flex flex-col items-center gap - 1 p - 2 rounded-lg border transition-all ${formData.eyeColor === eye.name ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/30'} `}
                                                    >
                                                        <div
                                                            className="w-10 h-10 rounded-full border-2 border-white/20 shadow-inner"
                                                            style={{ backgroundColor: eye.color }}
                                                        />
                                                        <span className="text-xs">{eye.name}</span>
                                                        {formData.eyeColor === eye.name && <Check size={12} className="text-primary" />}
                                                    </button>
                                                ))}
                                            </div>
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
                                <p className="text-gray-400">Select the environments that define your week.</p>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    {[
                                        { id: 'work', label: 'Corporate', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&fit=crop' },
                                        { id: 'casual', label: 'Casual / WFH', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&fit=crop' },
                                        { id: 'event', label: 'Social / Evening', img: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=400&fit=crop' },
                                        { id: 'active', label: 'Active', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&fit=crop' },
                                        { id: 'creative', label: 'Creative', img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&fit=crop' },
                                        { id: 'travel', label: 'Travel', img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&fit=crop' }
                                    ].map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                lifestyle: { ...prev.lifestyle, [item.id]: !prev.lifestyle[item.id as keyof typeof prev.lifestyle] }
                                            }))}
                                            className={`rounded-xl border text-left transition-all h-40 flex flex-col justify-end relative overflow-hidden group ${formData.lifestyle[item.id as keyof typeof formData.lifestyle] ? 'border-primary ring-2 ring-primary/50' : 'border-white/10'} `}
                                        >
                                            <div className="absolute inset-0">
                                                <img src={item.img} alt={item.label} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                <div className={`absolute inset-0 bg-black/60 transition-opacity ${formData.lifestyle[item.id as keyof typeof formData.lifestyle] ? 'opacity-40' : 'opacity-60 group-hover:opacity-50'} `} />
                                            </div>
                                            <div className="relative z-10 p-4">
                                                <span className={`font-bold text-lg ${formData.lifestyle[item.id as keyof typeof formData.lifestyle] ? 'text-primary' : 'text-white'} `}>{item.label}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center gap-3 text-primary mb-2">
                                    <Shirt size={24} />
                                    <span className="uppercase tracking-widest text-xs font-bold">Signature</span>
                                </div>
                                <h1 className="text-4xl font-serif font-bold">Aesthetics & Investment</h1>

                                {/* Reordered: Typical Investment FIRST */}
                                <div className="bg-surface glass p-6 rounded-xl border border-white/5 mb-8">
                                    <label className="block text-lg font-bold mb-4">Typical Investment per Item</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[
                                            { id: "budget", label: "High Street", range: "Rs. 1.5k - 8k" },
                                            { id: "mid", label: "Contemporary", range: "Rs. 8k - 40k" },
                                            { id: "luxury", label: "Designer", range: "Rs. 40k - 1.5L" },
                                            { id: "high_luxury", label: "Couture", range: "Rs. 1.5L+" }
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setFormData({ ...formData, priceRange: opt.id })}
                                                className={`p-4 rounded-lg border text-left flex justify-between items-center ${formData.priceRange === opt.id ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 hover:bg-white/5'} `}
                                            >
                                                <span className="font-medium">{opt.label}</span>
                                                <span className="text-sm opacity-70">{opt.range}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Dynamic Brands based on selection */}
                                {formData.priceRange && (
                                    <div className="animate-fade-in mb-8">
                                        <label className="block text-lg font-bold mb-3">Brands you admire (Select or type)</label>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {(formData.priceRange === 'budget' ? [
                                                'ZARA', 'H&M', 'Mango', 'Uniqlo', 'Massimo Dutti', 'COS', 'Forever 21',
                                                'Gap', 'Old Navy', 'Primark', 'Pull&Bear', 'Bershka', 'Stradivarius',
                                                'Topshop', 'ASOS'
                                            ] :
                                                formData.priceRange === 'mid' ? [
                                                    'Sandro', 'Reiss', 'Theory', 'Ted Baker', 'AllSaints', 'Maje', 'The Kooples',
                                                    'Club Monaco', 'Whistles', 'Cos', 'Ganni', 'Nanushka', 'Equipment',
                                                    '& Other Stories', 'Arket'
                                                ] :
                                                    formData.priceRange === 'luxury' ? [
                                                        'Gucci', 'Prada', 'YSL', 'Burberry', 'Ralph Lauren', 'Valentino', 'Givenchy',
                                                        'Celine', 'Fendi', 'Bottega Veneta', 'Loewe', 'Alexander McQueen', 'Versace',
                                                        'Balenciaga', 'Saint Laurent'
                                                    ] : [
                                                        'Chanel', 'Hermès', 'Dior', 'Brunello Cucinelli', 'Loro Piana', 'Tom Ford',
                                                        'The Row', 'Armani Privé', 'Kiton', 'Brioni', 'Zegna', 'Stefano Ricci',
                                                        'Berluti', 'Isaia', 'Givenchy Haute Couture'
                                                    ]
                                            ).map(brand => (
                                                <button
                                                    key={brand}
                                                    onClick={() => {
                                                        const current = formData.brands || [];
                                                        setFormData({
                                                            ...formData,
                                                            brands: current.includes(brand) ? current.filter(b => b !== brand) : [...current, brand]
                                                        });
                                                    }}
                                                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${formData.brands?.includes(brand) ? 'bg-primary text-black border-primary' : 'border-white/20 hover:border-white/40'} `}
                                                >
                                                    {brand}
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Other brands..."
                                            className="w-full bg-transparent border-b border-white/20 py-2 focus:border-primary focus:outline-none"
                                            value={Array.isArray(formData.brands) ? formData.brands.join(', ') : ''}
                                            onChange={e => setFormData({ ...formData, brands: e.target.value.split(',').map(s => s.trim()) })}
                                        />
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-xl font-bold mb-4">Aesthetic Vision</h3>
                                    <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                                        {[
                                            { name: "Old Money", desc: "Quiet luxury, heritage fabrics." },
                                            { name: "Minimalist", desc: "Clean lines, neutral palette." },
                                            { name: "High Street", desc: "Trend-driven, urban edge." },
                                            { name: "Classic", desc: "Timeless tailoring." },
                                            { name: "Bohemian", desc: "Free-spirited, artisanal." },
                                            { name: "Avant-Garde", desc: "Experimental, architectural." },
                                            { name: "Ivy League", desc: "Polished, collegiate." },
                                            { name: "Glamorous", desc: "Opulent materials, statement pieces." },
                                        ].map(archetype => (
                                            <button
                                                key={archetype.name}
                                                onClick={() => toggleArchetype(archetype.name)}
                                                type="button"
                                                className={`p-0 rounded-xl border text-left transition-all relative overflow-hidden group min - h-[140px] flex flex-col justify-end ${formData.archetypes.includes(archetype.name) ? 'border-primary ring-2 ring-primary/50' : 'border-white/10 hover:border-white/30'} `}
                                            >
                                                <div className="absolute inset-0 z-0">
                                                    {/* Fallback gradient background */}
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5" />

                                                    {/* Image with error handling */}
                                                    <img
                                                        src={aestheticVisuals[archetype.name]}
                                                        alt={archetype.name}
                                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                                                        onError={(e) => {
                                                            // Hide image if it fails to load, gradient will show
                                                            e.currentTarget.style.display = 'none';
                                                        }}
                                                        loading="lazy"
                                                    />
                                                    <div className={`absolute inset-0 bg - gradient - to - t from - black via - black / 50 to - transparent ${formData.archetypes.includes(archetype.name) ? 'opacity-90' : 'opacity-100'} `} />
                                                </div>
                                                <div className="relative z-10 p-3">
                                                    <div className={`font-bold text-lg leading - tight ${formData.archetypes.includes(archetype.name) ? 'text-primary' : 'text-white'} `}>{archetype.name}</div>
                                                    <div className="text-xs text-gray-300 mt-1 line-clamp-2">{archetype.desc}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
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
                                    {(avatarPreview || formData.avatar_url) ? (
                                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 group-hover:bg-black/30 transition-colors">
                                            <img
                                                src={avatarPreview || formData.avatar_url}
                                                alt="Avatar Preview"
                                                className="w-full h-full object-cover"
                                                onLoad={() => console.log('✅ Avatar loaded:', avatarPreview || formData.avatar_url)}
                                                onError={(e) => console.error('❌ Avatar failed:', e.currentTarget.src)}
                                            />
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

                    {/* Measurement Calculator Modal */}
                    {showMeasurementCalc && (
                        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowMeasurementCalc(false)}>
                            <div className="glass p-8 rounded-2xl max-w-2xl w-full border border-white/10" onClick={e => e.stopPropagation()}>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold">Measurement Guide</h3>
                                    <button onClick={() => setShowMeasurementCalc(false)} className="text-gray-400 hover:text-white">✕</button>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-lg mb-3">Enter Measurements (in cm)</h4>
                                        <div>
                                            <label className="block text-sm mb-2">Shoulders</label>
                                            <input
                                                type="number"
                                                value={measurements.shoulders}
                                                onChange={e => setMeasurements({ ...measurements, shoulders: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:border-primary focus:outline-none"
                                                placeholder="e.g., 45"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-2">Chest/Bust</label>
                                            <input
                                                type="number"
                                                value={measurements.chest}
                                                onChange={e => setMeasurements({ ...measurements, chest: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:border-primary focus:outline-none"
                                                placeholder="e.g., 95"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-2">Waist</label>
                                            <input
                                                type="number"
                                                value={measurements.waist}
                                                onChange={e => setMeasurements({ ...measurements, waist: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:border-primary focus:outline-none"
                                                placeholder="e.g., 75"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-2">Hips</label>
                                            <input
                                                type="number"
                                                value={measurements.hips}
                                                onChange={e => setMeasurements({ ...measurements, hips: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:border-primary focus:outline-none"
                                                placeholder="e.g., 100"
                                            />
                                        </div>
                                        <button
                                            onClick={() => calculateBodyShape()}
                                            className="btn btn-primary w-full"
                                        >
                                            Calculate Body Shape
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-lg mb-3">Reference Guide</h4>
                                        <div className="bg-white/5 rounded-lg p-4 space-y-2 text-sm">
                                            <p><strong>Shoulders:</strong> Measure across back from shoulder to shoulder</p>
                                            <p><strong>Chest/Bust:</strong> Measure around fullest part</p>
                                            <p><strong>Waist:</strong> Measure at natural waistline</p>
                                            <p><strong>Hips:</strong> Measure around fullest part of hips</p>
                                        </div>
                                        {formData.gender && (
                                            <div className="mt-4 p-3 bg-white/5 rounded-lg text-center">
                                                <p className="text-xs mb-2 text-gray-400">Body Shape Reference</p>
                                                <div className="grid grid-cols-3 gap-2 text-2xl">
                                                    {formData.gender === 'male' ? (
                                                        <>
                                                            <div className="flex flex-col items-center"><span>🔻</span><span className="text-[8px] text-gray-500 mt-1">Triangle</span></div>
                                                            <div className="flex flex-col items-center"><span>🔺</span><span className="text-[8px] text-gray-500 mt-1">Inv-Tri</span></div>
                                                            <div className="flex flex-col items-center"><span>⬜</span><span className="text-[8px] text-gray-500 mt-1">Rectangle</span></div>
                                                            <div className="flex flex-col items-center"><span>⭕</span><span className="text-[8px] text-gray-500 mt-1">Oval</span></div>
                                                            <div className="flex flex-col items-center"><span>🔶</span><span className="text-[8px] text-gray-500 mt-1">Trapezoid</span></div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="flex flex-col items-center"><span>⌛</span><span className="text-[8px] text-gray-500 mt-1">Hourglass</span></div>
                                                            <div className="flex flex-col items-center"><span>⬜</span><span className="text-[8px] text-gray-500 mt-1">Rectangle</span></div>
                                                            <div className="flex flex-col items-center"><span>🍐</span><span className="text-[8px] text-gray-500 mt-1">Pear</span></div>
                                                            <div className="flex flex-col items-center"><span>🔺</span><span className="text-[8px] text-gray-500 mt-1">Inv-Tri</span></div>
                                                            <div className="flex flex-col items-center"><span>🍎</span><span className="text-[8px] text-gray-500 mt-1">Apple</span></div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Onboarding() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <OnboardingContent />
        </Suspense>
    );
}
