"use client";

import { useState } from "react";
import { Upload, Link as LinkIcon, Loader2, Check, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddItemPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload');
    const [loading, setLoading] = useState(false);
    const [url, setUrl] = useState("");
    const [preview, setPreview] = useState<any>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", e.target.files[0]);

            // Mock upload for now, ideally upload to Supabase Storage first
            // Here we just analyze directly
            const res = await fetch("/api/wardrobe/analyze", { method: "POST", body: formData });
            const data = await res.json();

            // In a real app, we'd save to Supabase here
            console.log("Analyzed:", data);
            router.push("/wardrobe"); // Redirect to wardrobe
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLinkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/wardrobe/link", {
                method: "POST",
                body: JSON.stringify({ url }),
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();
            setPreview(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const saveDetails = () => {
        // Mock save
        router.push("/wardrobe");
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-4xl font-serif font-bold mb-2">Add New Item</h1>
            <p className="text-gray-400 mb-8">Expand your digital wardrobe.</p>

            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('upload')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 rounded-xl border transition-all ${activeTab === 'upload'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-white/10 opacity-50 hover:opacity-100'
                        }`}
                >
                    <Upload size={20} /> Upload Photo
                </button>
                <button
                    onClick={() => setActiveTab('link')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 rounded-xl border transition-all ${activeTab === 'link'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-white/10 opacity-50 hover:opacity-100'
                        }`}
                >
                    <LinkIcon size={20} /> Paste Link
                </button>
            </div>

            <div className="card glass p-8 min-h-[400px] flex flex-col items-center justify-center relative">
                {loading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-[var(--radius-lg)]">
                        <Loader2 className="animate-spin text-primary mb-4" size={48} />
                        <p className="text-primary font-medium">Analyzing...</p>
                    </div>
                )}

                {activeTab === 'upload' && (
                    <div className="w-full text-center">
                        <div className="border-2 border-dashed border-white/20 rounded-2xl h-80 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-white/5 relative group" onClick={() => document.getElementById('file-input')?.click()}>
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                            <Upload size={48} className="text-gray-500 mb-4 group-hover:text-primary transition-colors z-10" />
                            <span className="text-gray-400 z-10">Click to upload photo</span>
                            <input id="file-input" type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </div>
                    </div>
                )}

                {activeTab === 'link' && !preview && (
                    <form onSubmit={handleLinkSubmit} className="w-full space-y-6">
                        <div className="text-center mb-6">
                            <LinkIcon size={48} className="mx-auto text-gray-600 mb-4" />
                            <h3 className="text-xl font-bold">Paste Product URL</h3>
                            <p className="text-gray-400 text-sm">We'll fetch the image and details automatically.</p>
                        </div>
                        <input
                            type="url"
                            placeholder="https://zara.com/..."
                            className="bg-black/50 border-white/20 text-center"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn btn-primary w-full">
                            Analyze Link
                        </button>
                    </form>
                )}

                {activeTab === 'link' && preview && (
                    <div className="w-full text-left animate-fade-in">
                        <div className="flex gap-6">
                            <div className="w-1/3 aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden">
                                {preview.image_url ? (
                                    <img src={preview.image_url} alt="Product" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">No Image</div>
                                )}
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <p className="text-xs text-primary uppercase font-bold tracking-wider mb-1">Identified</p>
                                    <h3 className="text-2xl font-serif font-bold">{preview.sub_category || preview.category}</h3>
                                    <p className="text-gray-400 text-sm">{preview.brand}</p>
                                </div>
                                <p className="text-sm text-gray-300">{preview.description}</p>

                                <div className="flex flex-wrap gap-2">
                                    {preview.color && <span className="px-2 py-1 bg-white/10 rounded text-xs">{preview.color}</span>}
                                    {preview.price && <span className="px-2 py-1 bg-white/10 rounded text-xs">{preview.price}</span>}
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button onClick={() => setPreview(null)} className="btn btn-outline flex-1">Cancel</button>
                                    <button onClick={saveDetails} className="btn btn-primary flex-1">Save Item</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
