"use client";

import { useState } from "react";
import Link from "next/link";
import { Upload, Plus, Sparkles, Loader2 } from "lucide-react";
import { identifyWardrobeItem } from "@/lib/gemini"; // We need to handle client-side file reading, likely need server action or API route strictly for secrets security?
// Actually, using Gemini directly in client with API key exposed in NEXT_PUBLIC is bad practice.
// I should move Gemini logic to an API route (Server Side).
// But for prototype speed, if key is NEXT_PUBLIC... wait, `process.env.GEMINI_API_KEY` is server-side usually.
// I should create an API route `/api/analyze` to handle the file and call Gemini.
// The `lib/gemini.ts` uses `process.env.GEMINI_API_KEY`, so it must run on server.
// `identifyWardrobeItem` using `File` object (DOM type) might be tricky in Node environment without FormData parsing.
// I'll make `app/wardrobe/page.tsx` call an API route.

export default function WardrobePage() {
    const [items, setItems] = useState<any[]>([]);
    const [analyzing, setAnalyzing] = useState(false);

    // This would ideally upload to Supabase Storage, then send URL to Gemini.
    // For this demo, we'll send base64 to an API route (simplest).

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const file = e.target.files[0];
        setAnalyzing(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/wardrobe/analyze", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            setItems(prev => [{ ...data, image: URL.createObjectURL(file) }, ...prev]);
        } catch (err) {
            console.error(err);
            alert("Failed to analyze item");
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen p-8 pb-20">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-bold mb-2 font-serif">My Wardrobe</h1>
                    <p className="text-gray-400">Digitize and organize your style.</p>
                </div>
                <Link href="/add-item" className="btn btn-primary">
                    <Plus size={20} className="mr-2" /> Add Item
                </Link>
            </header>

            {analyzing && (
                <div className="mb-8 p-6 glass rounded-xl flex items-center gap-4 animate-fade-in text-[#d4af37]">
                    <Loader2 className="animate-spin" />
                    <span className="font-medium">Gemini is analyzing your item...</span>
                </div>
            )
            }

            {
                items.length === 0 && !analyzing ? (
                    <div className="text-center py-20 opacity-30">
                        <Upload size={64} className="mx-auto mb-4" />
                        <p className="text-xl">Your wardrobe is empty. Start adding items!</p>
                    </div>
                ) : (
                    <div className="grid-gallery">
                        {items.map((item, i) => (
                            <div key={i} className="card group relative">
                                <div className="aspect-[3/4] overflow-hidden bg-gray-800">
                                    <img src={item.image} alt={item.sub_category} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg capitalize">{item.sub_category || item.category}</h3>
                                        {item.score && (
                                            <span className="bg-white/10 text-xs px-2 py-1 rounded">{item.score}/10</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mb-3">{item.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-xs border border-white/20 px-2 py-1 rounded-full">{item.season}</span>
                                        <span className="text-xs border border-white/20 px-2 py-1 rounded-full">{item.color}</span>
                                    </div>
                                </div>

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
                                    <Sparkles size={24} className="text-[#d4af37] mb-2" />
                                    <p className="text-sm font-medium">{item.critique || "AI Suggestions coming soon"}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }
        </div >
    );
}
