"use client";

import { useState } from "react";
import { GlossaryText } from "@/components/GlossaryText";
import { Upload, Link as LinkIcon, Loader2, Check, AlertCircle, ArrowRight, TrendingUp, Search, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";

export default function AddItemPage() {
    const router = useRouter();
    const { profile } = useProfile();
    const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [url, setUrl] = useState("");
    const [preview, setPreview] = useState<any>(null);

    const simulateProgress = () => {
        setProgress(0);
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 10;
            });
        }, 500); // Slower simulation for "Deep Analysis" feel
        return interval;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setLoading(true);
        const interval = simulateProgress();
        setPreview(null);

        try {
            const formData = new FormData();
            formData.append("file", e.target.files[0]);
            // Pass Style DNA for scoring
            if (profile) {
                formData.append("style_profile", JSON.stringify(profile));
            }

            const res = await fetch("/api/wardrobe/analyze", { method: "POST", body: formData });
            const data = await res.json();

            clearInterval(interval);
            setProgress(100);

            if (data.error) throw new Error(data.error);
            setPreview(data);

        } catch (err) {
            console.error(err);
            alert("Analysis failed. Please try again.");
            clearInterval(interval);
        } finally {
            setLoading(false);
        }
    };

    const handleLinkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const interval = simulateProgress();
        setPreview(null);

        try {
            const res = await fetch("/api/wardrobe/link", {
                method: "POST",
                body: JSON.stringify({
                    url,
                    style_profile: profile
                }),
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();

            clearInterval(interval);
            setProgress(100);

            if (data.error) throw new Error(data.error);
            setPreview(data);
        } catch (err) {
            console.error(err);
            alert("Link analysis failed. Please try again.");
            clearInterval(interval);
        } finally {
            setLoading(false);
        }
    };



    const [saving, setSaving] = useState(false);

    const saveDetails = async () => {
        if (!preview) return;
        setSaving(true);
        try {
            const res = await fetch("/api/wardrobe/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(preview)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed");

            // Success
            router.push("/wardrobe");
        } catch (error) {
            console.error("Save Error:", error);
            alert("Failed to save item. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
            <h1 className="text-4xl font-serif font-bold mb-2">Add New Item</h1>
            <p className="text-gray-400 mb-8">Upload a photo or paste a link to get a detailed Style DNA analysis.</p>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 bg-surface p-1 rounded-xl border border-white/5 max-w-md">
                <button
                    onClick={() => setActiveTab('upload')}
                    className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-lg transition-all font-medium ${activeTab === 'upload'
                        ? 'bg-primary text-black shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Upload size={18} /> Upload Photo
                </button>
                <button
                    onClick={() => setActiveTab('link')}
                    className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-lg transition-all font-medium ${activeTab === 'link'
                        ? 'bg-primary text-black shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <LinkIcon size={18} /> Paste Link
                </button>
            </div>

            <div className={`card glass p-8 min-h-[400px] flex flex-col items-center justify-center relative shadow-2xl overflow-hidden transition-all duration-500 ${preview ? 'items-stretch justify-start' : ''}`}>
                {/* Progress Overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                        <div className="w-full max-w-sm mb-4">
                            <div className="flex justify-between text-xs text-primary mb-2 font-mono uppercase tracking-widest">
                                <span>Analyzing Style DNA</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_15px_#d4af37]"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-white">Gemini 3 Pro is analyzing...</h3>
                        <p className="text-gray-400 text-sm animate-pulse">Identifying brand, SKU, and calculating style score.</p>
                    </div>
                )}

                {/* Saving Overlay */}
                {saving && (
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                        <Loader2 size={48} className="text-primary animate-spin mb-4" />
                        <h3 className="text-xl font-bold mb-2 text-white">Saving to Wardrobe...</h3>
                    </div>
                )}

                {/* Input Modes (Hidden when preview is active) */}
                {!preview && activeTab === 'upload' && (
                    <div className="w-full text-center max-w-md animate-fade-in">
                        <div
                            className="border-2 border-dashed border-white/20 rounded-3xl h-80 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group relative overflow-hidden"
                            onClick={() => document.getElementById('file-input')?.click()}
                        >
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Upload size={32} className="text-gray-400 group-hover:text-primary transition-colors" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Drop your image here</h3>
                            <p className="text-gray-400 text-sm max-w-xs">Supports JPG, PNG, WEBP up to 5MB</p>

                            <input id="file-input" type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </div>
                    </div>
                )}

                {!preview && activeTab === 'link' && (
                    <form onSubmit={handleLinkSubmit} className="w-full max-w-md space-y-6 animate-fade-in">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                                <LinkIcon size={32} className="text-primary" />
                            </div>
                            <h3 className="text-xl font-bold">Import from URL</h3>
                            <p className="text-gray-400 text-sm">Paste a product link from Zara, H&M, Farfetch, etc.</p>
                        </div>

                        <div className="relative">
                            <input
                                type="url"
                                placeholder="https://store.com/product..."
                                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-4 pr-12 text-white placeholder:text-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                required
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">
                                <LinkIcon size={16} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full py-4 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40"
                            disabled={!url || loading}
                        >
                            Analyze Link <ArrowRight size={18} className="ml-2" />
                        </button>
                    </form>
                )}

                {/* Analysis Report */}
                {preview && (
                    <div className="w-full animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left: Image & Score */}
                        <div className="space-y-6">
                            <div className="aspect-[3/4] bg-gray-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
                                {preview.image_url ? (
                                    <img src={preview.image_url} alt="Product" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-white/5">
                                        <AlertCircle size={32} className="mb-2 opacity-50" />
                                        <span>No Image Available</span>
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-500 delay-300">
                                    <div className="bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/10 shadow-xl flex items-center gap-2">
                                        <span className="text-xs font-mono uppercase text-gray-400">Style Score</span>
                                        <span className={`text-xl font-bold ${preview.style_score > 80 ? 'text-green-400' : preview.style_score > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {preview.style_score || '?'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <h4 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                                    <TrendingUp size={16} className="text-primary" /> Style Analysis
                                </h4>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    <GlossaryText text={preview.style_reasoning || "Analyzing fit with your personal style..."} />
                                </p>
                            </div>
                        </div>

                        {/* Right: Details Report */}
                        <div className="flex flex-col h-full">
                            <div className="flex-1 space-y-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-gray-300 uppercase tracking-widest border border-white/5">
                                            {preview.brand || "Unknown Brand"}
                                        </span>
                                        <span className="text-sm text-gray-400 font-mono">
                                            {preview.price || preview.price_estimate || "Price Pending"}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-serif font-bold leading-tight mb-4">{preview.item_name || preview.sub_category || "Identified Item"}</h2>
                                    <p className="text-gray-300 leading-relaxed italic border-l-2 border-primary/30 pl-4 py-1">
                                        "<GlossaryText text={preview.description} />"
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                        <div className="text-xs text-gray-500 uppercase mb-1">Category</div>
                                        <div className="font-medium text-sm">{preview.category}</div>
                                    </div>
                                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                        <div className="text-xs text-gray-500 uppercase mb-1">Color</div>
                                        <div className="font-medium text-sm flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-current border border-white/20" style={{ color: preview.color?.toLowerCase() }}></span>
                                            {preview.color}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-primary/30 transition-colors group">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="text-xs text-primary font-bold uppercase tracking-wider flex items-center gap-1">
                                            <Search size={12} /> Find on Google
                                        </div>
                                        <ArrowRight size={14} className="text-gray-500 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0" />
                                    </div>
                                    <a
                                        href={`https://www.google.com/search?q=${encodeURIComponent((preview.brand || "") + " " + (preview.item_name || preview.sub_category))}&btnI=1`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium hover:text-primary underline decoration-primary/30 underline-offset-4"
                                    >
                                        View Product Page (Best Match)
                                    </a>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2 block flex items-center gap-1">
                                        <Tag size={12} /> Style Tags
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {preview.tags?.map((tag: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-white/5 text-gray-300 border border-white/10 rounded-full text-xs hover:bg-white/10 transition-colors cursor-default">
                                                #{tag}
                                            </span>
                                        ))}
                                        {preview.style_tags?.map((tag: string, i: number) => (
                                            <span key={`s-${i}`} className="px-3 py-1 bg-white/5 text-gray-300 border border-white/10 rounded-full text-xs hover:bg-white/10 transition-colors cursor-default">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 flex gap-4 mt-auto">
                                <button
                                    onClick={() => setPreview(null)}
                                    className="btn btn-outline flex-1 py-4 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveDetails}
                                    className="btn btn-primary flex-[2] py-4 text-sm group shadow-lg shadow-primary/20"
                                >
                                    Add to Wardrobe
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
