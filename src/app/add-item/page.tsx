"use client";

import { useState } from "react";
import { Upload, Link as LinkIcon, Loader2, Check, AlertCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddItemPage() {
    const router = useRouter();
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
        }, 300);
        return interval;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setLoading(true);
        const interval = simulateProgress();

        try {
            const formData = new FormData();
            formData.append("file", e.target.files[0]);

            const res = await fetch("/api/wardrobe/analyze", { method: "POST", body: formData });
            const data = await res.json();

            clearInterval(interval);
            setProgress(100);

            setTimeout(() => {
                router.push("/wardrobe");
            }, 500);
        } catch (err) {
            console.error(err);
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
                body: JSON.stringify({ url }),
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();

            clearInterval(interval);
            setProgress(100);
            setPreview(data);
        } catch (err) {
            console.error(err);
            clearInterval(interval);
        } finally {
            setLoading(false);
        }
    };

    const saveDetails = () => {
        // Mock save
        router.push("/wardrobe");
    };

    return (
        <div className="p-6 md:p-8 max-w-3xl mx-auto">
            <h1 className="text-4xl font-serif font-bold mb-2">Add New Item</h1>
            <p className="text-gray-400 mb-8">Expand your digital wardrobe with Gemini.</p>

            <div className="flex gap-4 mb-8 bg-surface p-1 rounded-xl border border-white/5">
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

            <div className="card glass p-8 min-h-[400px] flex flex-col items-center justify-center relative shadow-2xl overflow-hidden">
                {/* Progress Overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                        <div className="w-full max-w-sm mb-4">
                            <div className="flex justify-between text-xs text-primary mb-2 font-mono uppercase tracking-widest">
                                <span>Analyzing Item</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_10px_#d4af37]"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mb-1">Gemini is thinking...</h3>
                        <p className="text-gray-400 text-sm">Extracting style details, color, and brand.</p>
                    </div>
                )}

                {activeTab === 'upload' && (
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

                {activeTab === 'link' && !preview && (
                    <form onSubmit={handleLinkSubmit} className="w-full max-w-md space-y-6 animate-fade-in">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                                <LinkIcon size={32} className="text-primary" />
                            </div>
                            <h3 className="text-xl font-bold">Import from URL</h3>
                            <p className="text-gray-400 text-sm">Paste a product link from any major retailer.</p>
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

                {activeTab === 'link' && preview && (
                    <div className="w-full animate-fade-in">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Image Preview */}
                            <div className="w-full md:w-1/3 aspect-[3/4] bg-gray-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
                                {preview.image_url ? (
                                    <img src={preview.image_url} alt="Product" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-white/5">
                                        <AlertCircle size={32} className="mb-2 opacity-50" />
                                        <span>No Image Found</span>
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md border border-white/10">
                                    {preview.brand || "Unknown Brand"}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1 space-y-6">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs text-primary uppercase font-bold tracking-wider mb-2">Gemini Identification</p>
                                            <h3 className="text-3xl font-serif font-bold leading-tight">{preview.sub_category || preview.category}</h3>
                                        </div>
                                        {preview.price && (
                                            <div className="bg-white/10 px-3 py-1 rounded-lg font-mono text-sm">{preview.price}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <p className="text-sm text-gray-300 leading-relaxed italic">"{preview.description}"</p>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2 block">Detected Attributes</label>
                                    <div className="flex flex-wrap gap-2">
                                        {preview.category && <span className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-medium">{preview.category}</span>}
                                        {preview.color && <span className="px-3 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-xs font-medium">{preview.color}</span>}
                                        {preview.brand && <span className="px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-xs font-medium">{preview.brand}</span>}
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-4">
                                    <button onClick={() => setPreview(null)} className="btn btn-outline flex-1 py-3">Try Another</button>
                                    <button onClick={saveDetails} className="btn btn-primary flex-1 py-3 group">
                                        Save to Wardrobe <Check size={18} className="ml-2 group-hover:scale-125 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
