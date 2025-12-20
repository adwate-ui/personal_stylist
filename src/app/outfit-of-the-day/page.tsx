"use client";

import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import { generateOutfit } from "@/lib/gemini-client";
import { Loader2, Sparkles, Calendar, Clock, MapPin, CheckCircle2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function OutfitOfTheDay() {
    const { profile, loading: profileLoading } = useProfile();
    const router = useRouter();

    const [step, setStep] = useState<'input' | 'generating' | 'result'>('input');
    const [occasion, setOccasion] = useState("");
    const [timing, setTiming] = useState("Daytime");
    const [wardrobeItems, setWardrobeItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [outfit, setOutfit] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    // Fetch wardrobe on mount
    useEffect(() => {
        const fetchWardrobe = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('wardrobe_items')
                .select('*')
                .eq('user_id', user.id);

            if (data) setWardrobeItems(data);
        };
        fetchWardrobe();
    }, []);

    const handleGenerate = async () => {
        if (!occasion) {
            toast.error("Please enter an occasion");
            return;
        }
        if (!profile?.gemini_api_key) {
            toast.error("API Key missing. Please go to Profile settings.");
            return;
        }
        if (wardrobeItems.length < 2) {
            toast.error("Not enough items in wardrobe to generate an outfit.");
            return;
        }

        setStep('generating');
        try {
            const result = await generateOutfit(
                wardrobeItems,
                occasion,
                timing,
                profile.location,
                profile.gemini_api_key
            );
            setOutfit(result);
            setStep('result');
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate outfit. Please try again.");
            setStep('input');
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !outfit) return;

        const { error } = await supabase
            .from('outfits')
            .insert({
                user_id: user.id,
                occasion,
                date: new Date().toISOString().split('T')[0],
                outfit_data: outfit,
                feedback: null
            });

        setSaving(false);
        if (error) {
            toast.error("Failed to save outfit");
        } else {
            toast.success("Outfit saved to history!");
            router.push('/wardrobe'); // Or stay here? defaulting to wardrobe for now
        }
    };

    if (profileLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <main className="min-h-screen p-4 md:p-8 md:ml-64 pb-24 safe-area-pb">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-serif font-bold text-white mb-2 flex items-center gap-3">
                        <Sparkles className="text-primary" /> Outfit of the Day
                    </h1>
                    <p className="text-gray-400">Let AI style a perfect look for your day from your own wardrobe.</p>
                </header>

                {step === 'input' && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-xl mx-auto animate-fade-in text-center">
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-400 mb-2 text-left">Occasion</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-3.5 text-gray-500" size={20} />
                                <input
                                    type="text"
                                    placeholder="e.g., Casual Office, Date Night, Weekend Brunch..."
                                    value={occasion}
                                    onChange={(e) => setOccasion(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-400 mb-2 text-left">Timing</label>
                            <div className="grid grid-cols-2 gap-4">
                                {['Daytime', 'Evening'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTiming(t)}
                                        className={`py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 ${timing === t
                                                ? 'bg-primary text-black border-primary font-bold'
                                                : 'bg-black/20 border-white/10 text-gray-400 hover:bg-white/5'
                                            }`}
                                    >
                                        <Clock size={16} />
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={!occasion}
                            className="w-full bg-gradient-to-r from-primary to-amber-200 text-black font-bold py-4 rounded-xl text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Sparkles size={20} /> Generate Outfit
                        </button>
                    </div>
                )}

                {step === 'generating' && (
                    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                            <Sparkles size={64} className="text-primary relative z-10 animate-bounce" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Styling your look...</h2>
                        <p className="text-gray-400">Analyzing {wardrobeItems.length} items for "{occasion}"</p>
                    </div>
                )}

                {step === 'result' && outfit && (
                    <div className="animate-fade-in">
                        {/* Reasoning */}
                        <div className="bg-gradient-to-br from-primary/10 to-transparent p-6 rounded-2xl border border-primary/20 mb-8">
                            <h3 className="text-primary font-bold mb-2 flex items-center gap-2"><Sparkles size={16} /> Stylist's Note</h3>
                            <p className="text-white/90 italic leading-relaxed">"{outfit.reasoning}"</p>
                        </div>

                        {/* Outfit Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {[
                                { label: 'Top', item: outfit.top },
                                { label: 'Bottom', item: outfit.bottom }, // Might be null if dress is chosen? Logic typically returns one or other.
                                { label: 'Shoes', item: outfit.shoes },
                                { label: 'Layering', item: outfit.layering },
                                ...(outfit.accessories || []).map((item: any, i: number) => ({ label: `Accessory ${i + 1}`, item }))
                            ].filter(x => x.item).map((slot, idx) => (
                                <div key={idx} className="bg-white/5 rounded-xl p-3 border border-white/10 flex flex-col items-center group relative overflow-hidden">
                                    <div className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-black/40 mb-3 relative">
                                        <img
                                            src={slot.item.image_url}
                                            alt={slot.item.name}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    </div>
                                    <span className="text-xs text-primary font-bold uppercase tracking-wider mb-1">{slot.item.brand}</span>
                                    <span className="text-sm font-medium text-center truncate w-full">{slot.item.name || slot.item.sub_category}</span>
                                    <span className="text-xs text-gray-500 absolute top-2 right-2 bg-black/60 px-2 py-1 rounded backdrop-blur-sm">{slot.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Tips */}
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8">
                            <h3 className="font-bold text-white mb-4">✨ Styling Tips</h3>
                            <ul className="space-y-2">
                                {(outfit.style_tips || []).map((tip: string, i: number) => (
                                    <li key={i} className="flex gap-3 text-sm text-gray-300">
                                        <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-xs font-bold">{i + 1}</span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => setStep('input')}
                                className="px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 flex items-center gap-2 font-medium"
                            >
                                <RotateCcw size={18} /> Try Another
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-8 py-3 rounded-xl bg-primary text-black font-bold hover:opacity-90 flex items-center gap-2 shadow-lg shadow-primary/20"
                            >
                                {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                Confirm & Save Outfit
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
