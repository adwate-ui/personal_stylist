"use client";

import { useState } from "react";
import { Upload, Star, ThumbsUp, AlertCircle, ShoppingBag } from "lucide-react";

export default function ShopPage() {
    const [analysis, setAnalysis] = useState<any>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const file = e.target.files[0];
        setImagePreview(URL.createObjectURL(file));
        setAnalyzing(true);
        setAnalysis(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/shop/rate", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            setAnalysis(data);
        } catch (err) {
            console.error(err);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen p-8 pb-20 flex flex-col items-center">
            <h1 className="text-4xl font-bold mb-2">Shopping Assistant</h1>
            <p className="text-gray-400 mb-10">Rate my fit & automated styling advice.</p>

            <div className="w-full max-w-4xl grid md:grid-cols-2 gap-10">

                {/* Input Section */}
                <div className="space-y-6">
                    <div className="border-2 border-dashed border-white/20 rounded-2xl aspect-[4/5] flex flex-col items-center justify-center cursor-pointer hover:border-[#d4af37]/50 transition-colors bg-white/5 relative overflow-hidden"
                        onClick={() => document.getElementById('shop-upload')?.click()}>

                        {imagePreview ? (
                            <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                        ) : (
                            <>
                                <Upload size={48} className="text-gray-500 mb-4" />
                                <span className="text-gray-400">Upload screenshot or photo of item</span>
                            </>
                        )}

                        <input
                            id="shop-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleUpload}
                        />
                    </div>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                    {analyzing ? (
                        <div className="h-full flex flex-col items-center justify-center text-[#d4af37]">
                            <div className="animate-spin mb-4"><Star /></div>
                            <p>Consulting with AI Stylist...</p>
                        </div>
                    ) : analysis ? (
                        <div className="animate-fade-in space-y-6">

                            {/* Score Card */}
                            <div className="p-8 rounded-2xl glass border border-white/10 text-center">
                                <div className="text-6xl font-black mb-2" style={{ color: analysis.score >= 7 ? '#4ade80' : analysis.score >= 4 ? '#fbbf24' : '#ef4444' }}>
                                    {analysis.score}<span className="text-2xl text-gray-500">/10</span>
                                </div>
                                <div className="uppercase tracking-widest text-sm font-bold opacity-60">Style Score</div>
                            </div>

                            {/* Critique */}
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <h3 className="font-bold text-lg mb-2 flex items-center"><AlertCircle size={20} className="mr-2 text-[#d4af37]" /> Stylist Verdict</h3>
                                <p className="leading-relaxed opacity-90">{analysis.critique}</p>
                            </div>

                            {/* Alternatives */}
                            {analysis.alternatives && analysis.alternatives.length > 0 && (
                                <div>
                                    <h3 className="font-bold text-lg mb-4 flex items-center"><ThumbsUp size={20} className="mr-2 text-[#d4af37]" /> Better Alternatives</h3>
                                    <div className="grid gap-3">
                                        {analysis.alternatives.map((alt: string, i: number) => (
                                            <div key={i} className="p-4 rounded-xl bg-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/10">
                                                <span>{alt}</span>
                                                <ShoppingBag size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-600 opacity-50">
                            <p>Upload an item to see the magic.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
