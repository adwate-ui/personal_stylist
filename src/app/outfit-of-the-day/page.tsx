"use client";

import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import { generateOutfit } from "@/lib/gemini-client";
import { Loader2, Sparkles, Calendar, Clock, RotateCcw, Save, X, PlusCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function OutfitOfTheDay() {
    const { profile, loading: profileLoading } = useProfile();
    const router = useRouter();

    const [step, setStep] = useState<'input' | 'generating' | 'result'>('input');
    const [occasion, setOccasion] = useState("");
    const [timing, setTiming] = useState("Daytime");
    const [wardrobeItems, setWardrobeItems] = useState<any[]>([]);
    const [outfit, setOutfit] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    // Feature: Build Around Items
    const [selectedForBuild, setSelectedForBuild] = useState<string[]>([]);
    const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);

    // Feature: Swap Items
    const [swappingSlot, setSwappingSlot] = useState<string | null>(null);
    const [swapOptions, setSwapOptions] = useState<any[]>([]);

    useEffect(() => {
        const fetchWardrobe = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('wardrobe_items')
                .select('*')
                .eq('user_id', user.id);

            if (data) setWardrobeItems(data);
        };
        fetchWardrobe();
    }, []);

    const toggleBuildSelection = (id: string) => {
        if (selectedForBuild.includes(id)) {
            setSelectedForBuild(prev => prev.filter(i => i !== id));
        } else {
            if (selectedForBuild.length >= 2) {
                toast.error("You can select up to 2 anchor items.");
                return;
            }
            setSelectedForBuild(prev => [...prev, id]);
        }
    };

    const handleGenerate = async () => {
        if (!occasion) {
            toast.error("Please enter an occasion");
            return;
        }
        if (!profile?.gemini_api_key && !process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
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
                profile.gemini_api_key,
                selectedForBuild // Pass the anchor items
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
            router.push('/wardrobe');
        }
    };

    const openSwapModal = (slotLabel: string, currentItem: any) => {
        const targetCategory = currentItem?.category || slotLabel;
        const options = wardrobeItems.filter(item =>
            item.id !== currentItem?.id && (
                item.category === targetCategory ||
                item.sub_category === currentItem?.sub_category ||
                (slotLabel.includes('Accessory') && item.category === 'Accessories')
            )
        );
        setSwapOptions(options);
        setSwappingSlot(slotLabel);
    };

    const confirmSwap = (newItem: any) => {
        if (!swappingSlot) return;
        const newOutfit = { ...outfit };

        if (swappingSlot === 'Top') newOutfit.top = newItem;
        else if (swappingSlot === 'Bottom') newOutfit.bottom = newItem;
        else if (swappingSlot === 'Shoes') newOutfit.shoes = newItem;
        else if (swappingSlot === 'Layering') newOutfit.layering = newItem;
        else if (swappingSlot === 'Bag') newOutfit.bag = newItem;
        else if (swappingSlot.startsWith('Accessory')) {
            const index = parseInt(swappingSlot.split(' ')[1]) - 1;
            if (newOutfit.accessories && newOutfit.accessories[index]) {
                newOutfit.accessories[index] = newItem;
            } else {
                if (!newOutfit.accessories) newOutfit.accessories = [];
                newOutfit.accessories.push(newItem);
            }
        }
        setOutfit(newOutfit);
        setSwappingSlot(null);
        toast.success("Item updated!");
    };


    if (profileLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <main className="flex min-h-screen items-center justify-center p-4 md:p-8 md:ml-64 pb-24 safe-area-pb bg-gradient-to-br from-black to-zinc-950">
            <div className="max-w-4xl w-full mx-auto">
                <header className="mb-8 text-center md:text-left">
                    <h1 className="text-4xl font-serif font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-3">
                        <Sparkles className="text-primary" /> Outfit of the Day
                    </h1>
                    <p className="text-gray-400">AI-styled looks customized for you.</p>
                </header>

                {step === 'input' && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-xl mx-auto animate-fade-in text-center shadow-2xl backdrop-blur-sm">

                        {/* Occasion Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-400 mb-2 text-left">Occasion</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-3.5 text-gray-500" size={20} />
                                <input
                                    type="text"
                                    placeholder="e.g., Casual Office, Dinner Date..."
                                    value={occasion}
                                    onChange={(e) => setOccasion(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-primary focus:ring-1 outline-none transition-all placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        {/* Timing Input */}
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

                        {/* Feature: Build Around Items */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-gray-400">Anchor Items (Optional)</label>
                                <button onClick={() => setIsBuildModalOpen(true)} className="text-xs text-primary hover:underline flex items-center gap-1">
                                    <PlusCircle size={12} /> Select Items
                                </button>
                            </div>

                            {selectedForBuild.length > 0 ? (
                                <div className="flex gap-2 flex-wrap justify-center">
                                    {selectedForBuild.map(id => {
                                        const item = wardrobeItems.find(i => i.id === id);
                                        return (
                                            <div key={id} className="bg-primary/20 border border-primary/40 rounded-lg px-3 py-1 flex items-center gap-2 text-sm text-primary">
                                                <img src={item?.image_url} className="w-6 h-6 rounded object-cover" alt="" />
                                                <span className="truncate max-w-[100px]">{item?.name || item?.category}</span>
                                                <button onClick={() => toggleBuildSelection(id)}><X size={14} /></button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsBuildModalOpen(true)}
                                    className="w-full py-3 border border-dashed border-white/20 rounded-xl text-gray-500 hover:text-white hover:border-white/40 transition-colors text-sm"
                                >
                                    + Select items to build outfit around
                                </button>
                            )}
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={!occasion}
                            className="w-full bg-gradient-to-r from-primary to-amber-200 text-black font-bold py-4 rounded-xl text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
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
                    <div className="w-full animate-fade-in">
                        {/* Reasoning */}
                        <div className="bg-gradient-to-br from-primary/10 to-transparent p-6 rounded-2xl border border-primary/20 mb-8 text-center md:text-left backdrop-blur-sm">
                            <h3 className="text-primary font-bold mb-2 flex items-center justify-center md:justify-start gap-2"><Sparkles size={16} /> Stylist's Note</h3>
                            <p className="text-white/90 italic leading-relaxed">"{outfit.reasoning}"</p>
                        </div>

                        {/* Outfit Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                            {[
                                { label: 'Top', item: outfit.top },
                                { label: 'Bottom', item: outfit.bottom },
                                { label: 'Shoes', item: outfit.shoes },
                                { label: 'Layering', item: outfit.layering },
                                { label: 'Bag', item: outfit.bag },
                                ...(outfit.accessories || []).map((item: any, i: number) => ({ label: `Accessory ${i + 1}`, item }))
                            ].filter(x => x.item).map((slot, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => openSwapModal(slot.label, slot.item)}
                                    className="bg-white/5 rounded-xl p-3 border border-white/10 flex flex-col items-center group relative overflow-hidden cursor-pointer hover:border-primary/50 transition-all hover:scale-[1.02]"
                                >
                                    <div className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-black/40 mb-3 relative">
                                        <img
                                            src={slot.item.image_url}
                                            alt={slot.item.name}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <span className="text-white font-medium flex items-center gap-1"><RotateCcw size={14} /> Swap</span>
                                        </div>
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

            {/* Build Modal */}
            {isBuildModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-fade-in">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h3 className="font-bold text-lg text-white">Select Items to Build Around</h3>
                            <button onClick={() => setIsBuildModalOpen(false)} className="text-gray-400 hover:text-white p-2">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 md:grid-cols-4 gap-4">
                            {wardrobeItems.map((item) => {
                                const isSelected = selectedForBuild.includes(item.id);
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => toggleBuildSelection(item.id)}
                                        className={`relative rounded-xl overflow-hidden aspect-[3/4] border-2 group transition-all ${isSelected ? 'border-primary opacity-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                    >
                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 bg-primary text-black p-1 rounded-full shadow-lg">
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-xs text-white truncate text-center">
                                            {item.name || item.sub_category}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="p-4 border-t border-white/10 flex justify-between items-center">
                            <span className="text-sm text-gray-400">{selectedForBuild.length}/2 selected</span>
                            <button onClick={() => setIsBuildModalOpen(false)} className="bg-primary text-black px-6 py-2 rounded-lg font-bold hover:opacity-90">
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Swap Modal */}
            {swappingSlot && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl animate-fade-in">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h3 className="font-bold text-lg text-white">Select {swappingSlot}</h3>
                            <button onClick={() => setSwappingSlot(null)} className="text-gray-400 hover:text-white p-2">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-4">
                            {swapOptions.length === 0 ? (
                                <div className="col-span-2 text-center text-gray-500 py-8">
                                    No compatible items found in your wardrobe.
                                </div>
                            ) : (
                                swapOptions.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => confirmSwap(item)}
                                        className="bg-black/40 rounded-xl p-3 border border-white/10 hover:border-primary text-left group transition-all"
                                    >
                                        <div className="aspect-[3/4] w-full rounded-lg overflow-hidden mb-2 bg-gray-800">
                                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        </div>
                                        <p className="font-medium text-sm truncate text-white">{item.name || item.sub_category}</p>
                                        <p className="text-xs text-gray-500">{item.brand}</p>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
