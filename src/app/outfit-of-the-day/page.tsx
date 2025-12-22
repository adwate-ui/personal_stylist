"use client";

import { useState, useEffect, Suspense } from "react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import { generateOutfit } from "@/lib/gemini-client";
import { Loader2, Sparkles, Calendar, Clock, RotateCcw, Save, X, PlusCircle, Check, History, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { useTask } from "@/contexts/TaskContext";
import { useSearchParams } from "next/navigation";

function OutfitContent() {
    const { profile, loading: profileLoading } = useProfile();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { startTask, getTaskResult } = useTask();

    // Check for returned task results
    const taskId = searchParams.get('taskId');

    const [step, setStep] = useState<'input' | 'generating' | 'result'>('input');
    const [occasion, setOccasion] = useState("");
    const [timing, setTiming] = useState("Daytime");
    const [wardrobeItems, setWardrobeItems] = useState<any[]>([]);
    const [outfit, setOutfit] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    // History
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);

    // Feature: Build Around Items
    const [selectedForBuild, setSelectedForBuild] = useState<string[]>([]);
    const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);

    // Feature: Swap Items
    const [swappingSlot, setSwappingSlot] = useState<string | null>(null);
    const [swapOptions, setSwapOptions] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch Wardrobe
            const { data: wardrobe } = await supabase
                .from('wardrobe_items')
                .select('*')
                .eq('user_id', user.id);

            if (wardrobe) setWardrobeItems(wardrobe);

            // Fetch History
            const { data: savedOutfits } = await supabase
                .from('outfits')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (savedOutfits) setHistory(savedOutfits);
            setLoadingHistory(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (taskId) {
            const result = getTaskResult(taskId);
            if (result) {
                setOutfit(result);
                setStep('result');
                toast.success("Outfit ready!");
            }
        }
    }, [taskId, getTaskResult]);

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

        const taskId = `ootd-${Date.now()}`;
        const taskPromise = generateOutfit(
            wardrobeItems,
            occasion,
            timing,
            profile.location,
            profile.gemini_api_key || process.env.NEXT_PUBLIC_GEMINI_API_KEY,
            selectedForBuild
        );

        startTask(taskId, 'ootd', `Styling for ${occasion}...`, taskPromise);

        try {
            const result = await taskPromise;
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

        const { error, data } = await supabase
            .from('outfits')
            .insert({
                user_id: user.id,
                occasion,
                date: new Date().toISOString().split('T')[0],
                outfit_data: outfit,
                feedback: null
            })
            .select() // Return the saved row to update UI
            .single();

        setSaving(false);
        if (error) {
            toast.error("Failed to save outfit");
        } else {
            toast.success("Outfit saved to history!");
            // Add to history list immediately
            if (data) setHistory(prev => [data, ...prev]);
            setStep('input');
            setOccasion("");
            setOutfit(null);
            setSelectedForBuild([]);
        }
    };

    const openSwapModal = (slotLabel: string, currentItem: any) => {
        const targetCategory = currentItem?.category || slotLabel;
        const options = wardrobeItems.filter(item =>
            item.id !== currentItem?.id && (
                item.category === targetCategory || // Match exact category
                item.sub_category === currentItem?.sub_category || // Match exact sub-category
                (slotLabel === 'Layering' && ['Jackets', 'Coats', 'Suits'].includes(item.category)) || // Smart fallback for layering
                (slotLabel.includes('Accessory') && item.category === 'Accessories') ||
                (slotLabel === 'Watch' && (item.category === 'Watches' || item.category === 'Accessories')) ||
                (slotLabel === 'Wallet' && (item.category === 'Bags' || item.category === 'Accessories'))
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
        else if (swappingSlot === 'Watch') newOutfit.watch = newItem;
        else if (swappingSlot === 'Wallet') newOutfit.wallet = newItem;
        else if (swappingSlot === 'Headwear') newOutfit.headwear = newItem;
        else if (swappingSlot === 'Belt') newOutfit.belt = newItem;
        else if (swappingSlot === 'Scarf') newOutfit.scarf = newItem;
        else if (swappingSlot === 'Gloves') newOutfit.gloves = newItem;
        else if (swappingSlot === 'Sunglasses') newOutfit.sunglasses = newItem;
        else if (swappingSlot === 'Jewelry') newOutfit.jewelry = newItem;
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
        <main className="min-h-screen p-4 md:p-8 pb-24 safe-area-pb bg-gradient-to-br from-black to-zinc-950 flex flex-col items-center">
            <div className="max-w-7xl w-full mx-auto flex flex-col items-center flex-1 justify-center">

                <header className="mb-12 text-center">
                    <h1 className="text-5xl font-serif font-bold text-white mb-3 flex items-center justify-center gap-3">
                        <Sparkles className="text-primary" size={40} /> Outfit of the Day
                    </h1>
                    <p className="text-gray-400 text-lg">AI-styled looks customized for you.</p>
                </header>

                {step === 'input' && (
                    <div className="w-full max-w-2xl bg-[#090909] border border-white/5 rounded-3xl p-8 md:p-12 animate-fade-in shadow-2xl backdrop-blur-sm relative overflow-hidden group">
                        {/* Decorative background glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors duration-1000" />

                        {/* Occasion Input */}
                        <div className="mb-8">
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 text-center">Where are you going?</label>
                            <div className="relative max-w-md mx-auto">
                                <Calendar className="absolute left-4 top-4 text-gray-500" size={20} />
                                <input
                                    type="text"
                                    placeholder="e.g., Casual Office, Dinner Date..."
                                    value={occasion}
                                    onChange={(e) => setOccasion(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-lg focus:border-primary focus:ring-1 outline-none transition-all placeholder:text-gray-600 text-center"
                                />
                            </div>
                        </div>

                        {/* Timing Input */}
                        <div className="mb-10 text-center">
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">When is it?</label>
                            <div className="inline-flex bg-black/40 p-1 rounded-2xl border border-white/5">
                                {['Daytime', 'Evening'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTiming(t)}
                                        className={`py-3 px-8 rounded-xl transition-all flex items-center gap-2 font-medium ${timing === t
                                            ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-100'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <Clock size={16} />
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Feature: Build Around Items */}
                        <div className="mb-10 text-center">
                            <div className="flex justify-center items-center gap-2 mb-4">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Start with Specific Items</label>
                            </div>

                            {selectedForBuild.length > 0 ? (
                                <div className="flex gap-3 flex-wrap justify-center">
                                    {selectedForBuild.map(id => {
                                        const item = wardrobeItems.find(i => i.id === id);
                                        return (
                                            <div key={id} className="bg-surface border border-white/10 rounded-xl pl-2 pr-3 py-2 flex items-center gap-3 text-sm text-white shadow-lg animate-scale-in">
                                                <img src={item?.image_url} className="w-10 h-10 rounded-lg object-cover bg-gray-800" alt="" />
                                                <div className="text-left">
                                                    <div className="font-bold text-xs truncate max-w-[100px]">{item?.name || item?.category}</div>
                                                    <div className="text-[10px] text-gray-500">{item?.brand}</div>
                                                </div>
                                                <button onClick={() => toggleBuildSelection(id)} className="text-gray-400 hover:text-red-400 ml-1"><X size={16} /></button>
                                            </div>
                                        );
                                    })}
                                    {selectedForBuild.length < 2 && (
                                        <button onClick={() => setIsBuildModalOpen(true)} className="w-14 h-14 rounded-xl border border-dashed border-white/20 flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-colors">
                                            <PlusCircle size={24} />
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsBuildModalOpen(true)}
                                    className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-2 mx-auto border border-primary/20 px-4 py-2 rounded-full hover:bg-primary/10"
                                >
                                    <PlusCircle size={16} /> Build around Wardrobe Item
                                </button>
                            )}
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={!occasion}
                            className="w-full bg-gradient-to-r from-primary to-amber-200 text-black font-bold py-5 rounded-2xl text-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
                        >
                            <Sparkles size={24} /> Generate Outfit
                        </button>
                    </div>
                )}

                {step === 'generating' && (
                    <div className="flex flex-col items-center justify-center py-32 animate-fade-in w-full max-w-2xl bg-[#090909] border border-white/5 rounded-3xl">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                            <Sparkles size={80} className="text-primary relative z-10 animate-bounce" />
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-white mb-2">Styling your look...</h2>
                        <p className="text-gray-400 text-lg">Applying world-class styling rules...</p>
                    </div>
                )}

                {step === 'result' && outfit && (
                    <div className="w-full animate-fade-in max-w-6xl">
                        {/* Reasoning */}
                        <div className="bg-gradient-to-r from-primary/10 via-transparent to-transparent p-6 mb-10 text-center border-l-4 border-primary/50">
                            <h3 className="text-primary font-bold mb-2 flex items-center justify-center gap-2 uppercase tracking-wide text-xs"><Sparkles size={14} /> Stylist's Rationale</h3>
                            <p className="text-white/90 text-xl font-serif italic leading-relaxed max-w-3xl mx-auto">"{outfit.reasoning}"</p>
                        </div>

                        {/* Outfit Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                            {[
                                { label: 'Top', item: outfit.top },
                                { label: 'Bottom', item: outfit.bottom },
                                { label: 'Shoes', item: outfit.shoes },
                                { label: 'Layering', item: outfit.layering },
                                { label: 'Bag', item: outfit.bag },
                                { label: 'Watch', item: outfit.watch },
                                { label: 'Wallet', item: outfit.wallet },
                                { label: 'Headwear', item: outfit.headwear },
                                { label: 'Belt', item: outfit.belt },
                                { label: 'Sunglasses', item: outfit.sunglasses },
                                { label: 'Jewelry', item: outfit.jewelry },
                                { label: 'Scarf', item: outfit.scarf },
                                { label: 'Gloves', item: outfit.gloves },
                                ...(outfit.accessories || []).map((item: any, i: number) => ({ label: `Accessory ${i + 1}`, item }))
                            ].filter(x => x.item).map((slot, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => openSwapModal(slot.label, slot.item)}
                                    className="group relative cursor-pointer"
                                >
                                    <div className="aspect-[3/4] bg-surface rounded-2xl overflow-hidden mb-3 relative border border-white/5 transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                                        <img
                                            src={slot.item.image_url}
                                            alt={slot.item.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <span className="text-white font-medium flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20"><RotateCcw size={16} /> Swap</span>
                                        </div>
                                        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] text-gray-300 uppercase tracking-wider font-bold">
                                            {slot.label}
                                        </div>
                                    </div>
                                    <div className="text-center px-2">
                                        <div className="text-xs text-primary font-bold uppercase tracking-wider mb-1">{slot.item.brand}</div>
                                        <div className="font-medium text-white truncate w-full">{slot.item.name || slot.item.sub_category}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tips */}
                        <div className="bg-[#090909] rounded-2xl p-8 border border-white/5 mb-10 max-w-4xl mx-auto">
                            <h3 className="font-bold text-white mb-6 text-center uppercase tracking-widest text-sm">Styling Tips</h3>
                            <div className="grid md:grid-cols-3 gap-6">
                                {(outfit.style_tips || []).map((tip: string, i: number) => (
                                    <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-sm font-bold mb-3">{i + 1}</span>
                                        <p className="text-sm text-gray-300 leading-relaxed">{tip}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => setStep('input')}
                                className="px-8 py-4 rounded-xl border border-white/10 text-white hover:bg-white/5 flex items-center gap-2 font-bold transition-all hover:scale-105"
                            >
                                <RotateCcw size={20} /> Discard & Try Again
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-10 py-4 rounded-xl bg-primary text-black font-bold hover:brightness-110 flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-primary/40"
                            >
                                {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                Confirm & Save to History
                            </button>
                        </div>
                    </div>
                )}

                {/* SAVED OUTFITS HISTORY */}
                {step === 'input' && (
                    <div className="mt-20 w-full max-w-7xl border-t border-white/10 pt-10">
                        <div className="flex items-center gap-3 mb-8">
                            <History className="text-primary" size={24} />
                            <h2 className="text-2xl font-bold text-white">Recent Looks</h2>
                        </div>

                        {loadingHistory ? (
                            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-500" /></div>
                        ) : history.length === 0 ? (
                            <div className="text-gray-500 italic">No saved outfits yet. Create your first look above!</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {history.map((saved: any) => (
                                    <button
                                        key={saved.id}
                                        onClick={() => setSelectedHistoryItem(saved)}
                                        className="bg-[#090909] border border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 transition-all hover:-translate-y-1 group w-full text-left"
                                    >
                                        <div className="p-4 border-b border-white/5 flex justify-between items-start">
                                            <div>
                                                <div className="font-bold text-white">{saved.occasion}</div>
                                                <div className="text-xs text-gray-500 mt-1">{new Date(saved.date).toLocaleDateString()}</div>
                                            </div>
                                            <div className="text-xs bg-white/5 px-2 py-1 rounded text-primary truncate max-w-[100px]">{saved.outfit_data.reasoning?.substring(0, 30)}...</div>
                                        </div>
                                        <div className="p-4 grid grid-cols-5 gap-1">
                                            {[
                                                saved.outfit_data.top,
                                                saved.outfit_data.bottom,
                                                saved.outfit_data.shoes,
                                            ].filter(Boolean).map((item: any, i: number) => (
                                                <div key={i} className="aspect-[3/4] bg-surface rounded overflow-hidden">
                                                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                            <div className="aspect-[3/4] bg-surface rounded overflow-hidden flex items-center justify-center text-xs text-gray-500 bg-white/5">
                                                <span className="text-[10px]">View all</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Build Modal */}
            {isBuildModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setIsBuildModalOpen(false)}>
                    <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1a1a1a]">
                            <h3 className="font-bold text-xl text-white">Select Anchor Items</h3>
                            <button onClick={() => setIsBuildModalOpen(false)} className="text-gray-400 hover:text-white p-2">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                                {wardrobeItems.map((item) => {
                                    const isSelected = selectedForBuild.includes(item.id);
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => toggleBuildSelection(item.id)}
                                            className={`relative rounded-xl overflow-hidden aspect-[3/4] border-2 group transition-all duration-200 ${isSelected ? 'border-primary ring-2 ring-primary/20 opacity-100 scale-95' : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'}`}
                                        >
                                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[1px]">
                                                    <div className="bg-primary text-black p-2 rounded-full shadow-lg">
                                                        <Check size={20} strokeWidth={3} />
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/10 flex justify-between items-center bg-[#1a1a1a]">
                            <span className="text-sm text-gray-400 font-medium">{selectedForBuild.length}/2 selected</span>
                            <button onClick={() => setIsBuildModalOpen(false)} className="bg-primary text-black px-8 py-3 rounded-xl font-bold hover:brightness-110 shadow-lg shadow-primary/20">
                                Confirm Selection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Swap Modal */}
            {swappingSlot && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSwappingSlot(null)}>
                    <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1a1a1a]">
                            <h3 className="font-bold text-xl text-white">Select {swappingSlot}</h3>
                            <button onClick={() => setSwappingSlot(null)} className="text-gray-400 hover:text-white p-2">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            {swapOptions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-4">
                                    <Sparkles size={40} className="opacity-20" />
                                    <p>No other compatible items found in your wardrobe.</p>
                                    <button onClick={() => setSwappingSlot(null)} className="text-primary hover:underline">Close</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {swapOptions.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => confirmSwap(item)}
                                            className="bg-[#090909] rounded-xl overflow-hidden border border-white/10 hover:border-primary text-left group transition-all hover:-translate-y-1 hover:shadow-xl"
                                        >
                                            <div className="aspect-[3/4] w-full bg-gray-800 relative">
                                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-primary/10 transition-colors" />
                                            </div>
                                            <div className="p-3">
                                                <p className="font-bold text-sm truncate text-white">{item.name || item.sub_category}</p>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">{item.brand}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal for History */}
            {selectedHistoryItem && (
                <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelectedHistoryItem(null)}>
                    <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1a1a1a] sticky top-0 z-10">
                            <div>
                                <h3 className="font-bold text-2xl text-white">{selectedHistoryItem.occasion}</h3>
                                <p className="text-sm text-gray-400">{new Date(selectedHistoryItem.date).toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => setSelectedHistoryItem(null)} className="text-gray-400 hover:text-white p-2">
                                <X size={28} />
                            </button>
                        </div>

                        <div className="p-8">
                            {/* Rationale */}
                            <div className="bg-primary/10 p-6 rounded-2xl mb-10 text-center border border-primary/20">
                                <h3 className="text-primary font-bold mb-2 flex items-center justify-center gap-2 uppercase tracking-wide text-xs"><Sparkles size={14} /> Analysis</h3>
                                <p className="text-white/90 text-lg font-serif italic leading-relaxed max-w-3xl mx-auto">"{selectedHistoryItem.outfit_data.reasoning}"</p>
                            </div>

                            {/* Outfit Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                                {[
                                    { label: 'Top', item: selectedHistoryItem.outfit_data.top },
                                    { label: 'Bottom', item: selectedHistoryItem.outfit_data.bottom },
                                    { label: 'Shoes', item: selectedHistoryItem.outfit_data.shoes },
                                    { label: 'Layering', item: selectedHistoryItem.outfit_data.layering },
                                    { label: 'Bag', item: selectedHistoryItem.outfit_data.bag },
                                    { label: 'Watch', item: selectedHistoryItem.outfit_data.watch },
                                    { label: 'Wallet', item: selectedHistoryItem.outfit_data.wallet },
                                    { label: 'Headwear', item: selectedHistoryItem.outfit_data.headwear },
                                    { label: 'Belt', item: selectedHistoryItem.outfit_data.belt },
                                    { label: 'Sunglasses', item: selectedHistoryItem.outfit_data.sunglasses },
                                    { label: 'Jewelry', item: selectedHistoryItem.outfit_data.jewelry },
                                    { label: 'Scarf', item: selectedHistoryItem.outfit_data.scarf },
                                    { label: 'Gloves', item: selectedHistoryItem.outfit_data.gloves },
                                    ...(selectedHistoryItem.outfit_data.accessories || []).map((item: any, i: number) => ({ label: `Accessory ${i + 1}`, item }))
                                ].filter(x => x.item).map((slot, idx) => (
                                    <div key={idx} className="bg-surface rounded-2xl overflow-hidden border border-white/5">
                                        <div className="aspect-[3/4] bg-gray-800 relative">
                                            <img
                                                src={slot.item.image_url}
                                                alt={slot.item.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] text-gray-300 uppercase tracking-wider font-bold">
                                                {slot.label}
                                            </div>
                                        </div>
                                        <div className="p-3 text-center">
                                            <div className="text-xs text-primary font-bold uppercase tracking-wider mb-1">{slot.item.brand}</div>
                                            <div className="font-medium text-white truncate w-full text-sm">{slot.item.name || slot.item.sub_category}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Tips */}
                            <div className="bg-[#090909] rounded-2xl p-8 border border-white/5 max-w-4xl mx-auto">
                                <h3 className="font-bold text-white mb-6 text-center uppercase tracking-widest text-sm">Styling Tips</h3>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {(selectedHistoryItem.outfit_data.style_tips || []).map((tip: string, i: number) => (
                                        <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5">
                                            <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-sm font-bold mb-3">{i + 1}</span>
                                            <p className="text-sm text-gray-300 leading-relaxed">{tip}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default function OutfitOfTheDay() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
            <OutfitContent />
        </Suspense>
    );
}
