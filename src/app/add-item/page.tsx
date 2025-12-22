"use client";

import { toast } from "sonner";

import { useState, useEffect, Suspense } from "react";
import { GlossaryText } from "@/components/GlossaryText";
import { AddItemSkeleton } from "@/components/Skeleton";
import { Upload, Link as LinkIcon, Loader2, Check, AlertCircle, ArrowRight, TrendingUp, Search, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useProfile } from "@/hooks/useProfile";
import { analyzeImageWithGemini, analyzeLinkWithGemini } from "@/lib/gemini-client";
import { WardrobeItemAnalysis } from "@/types/wardrobe";
import { supabase } from "@/lib/supabase";
import { getProductLink } from "@/lib/product-links";
import { extractBestImage } from "@/lib/image-extractor";
import { useTask } from "@/contexts/TaskContext";
import { useSearchParams } from "next/navigation";

function AddItemContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { startTask, getTaskResult } = useTask();
    const { profile } = useProfile();
    const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload');
    const taskId = searchParams.get('taskId');

    // ... rest of state ...
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [wardrobeItems, setWardrobeItems] = useState<Array<{ name: string; category: string; color?: string }>>([]);
    const [url, setUrl] = useState("");
    const [preview, setPreview] = useState<WardrobeItemAnalysis | null>(null);

    // Initial check for task results (if returning from background task)
    useEffect(() => {
        if (taskId) {
            const result = getTaskResult(taskId);
            if (result) {
                setPreview(result);
                // Switch to link tab if it looks like a link result, or upload if image
                // Assuming result is WardrobeItemAnalysis which is mostly generic
                // If it has product_link, it might be a link analysis
                toast.success("Analysis result loaded!");
            }
        }
    }, [taskId, getTaskResult]);

    // ... existing simulateProgress ...
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
        }, 500);
        return interval;
    };

    // ... handleFileUpload ...

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setLoading(true);
        const interval = simulateProgress();
        setPreview(null);
        const file = e.target.files[0];

        try {
            // Get API key from profile (preferred) or localStorage (fallback)
            const apiKey = profile.gemini_api_key || localStorage.getItem("gemini_api_key");

            if (!apiKey) {
                toast.error("API Key Required", {
                    description: "Please set your Gemini API key in your profile to use AI analysis.",
                    duration: 6000,
                    action: {
                        label: "Go to Profile",
                        onClick: () => router.push("/profile")
                    }
                });
                clearInterval(interval);
                setLoading(false);
                return;
            }

            // Client-side analysis with wardrobe context
            const data = await analyzeImageWithGemini(file, apiKey, profile.location, wardrobeItems);

            clearInterval(interval);
            setProgress(100);

            if (data.error) throw new Error(data.message || data.error);
            // Append the uploaded image as a blob URL for preview
            data.image_url = URL.createObjectURL(file);
            // Map primary_color to color field
            if (data.primary_color && !data.color) {
                data.color = data.primary_color;
            }
            setPreview(data);

        } catch (err) {
            console.error(err);
            toast.error("Analysis Failed", { description: (err as Error).message || "Please try again.", duration: 5000 });
            clearInterval(interval);
        } finally {
            setLoading(false);
        }
    };


    const performAnalysis = async (urlToAnalyze: string) => {
        // Use Cloudflare Worker for server-side scraping
        const workerUrl = 'https://authentiqc-worker.adwate.workers.dev/fetch-metadata';
        let data: any = { imageUrl: null, imageBase64: null, title: null, price: null, brand: null };
        let fetchFailed = false;

        try {
            if (urlToAnalyze.includes('google.com/search')) {
                throw new Error('Skipping AuthentiQC for search URL');
            }
            const response = await fetch(`${workerUrl}?url=${encodeURIComponent(urlToAnalyze)}`);
            if (response.ok) {
                const rawData = await response.json();
                data.imageUrl = rawData.image || (rawData.images && rawData.images.length > 0 ? rawData.images[0] : null);
                data.title = rawData.title || null;
                data.price = rawData.price || null;
                data.brand = rawData.site_name || rawData.brand || null;
            } else {
                fetchFailed = true;
            }
        } catch (err) {
            fetchFailed = true;
        }

        // Image extraction logic (simplified for brevity, main logic remains)
        if ((!data.imageBase64 && !data.image && !data.imageUrl) || fetchFailed) {
            if (profile.image_extractor_api_key) {
                try {
                    const extractedUrl = await extractBestImage(urlToAnalyze, profile.image_extractor_api_key);
                    if (extractedUrl) {
                        data.imageUrl = extractedUrl;
                        fetchFailed = false;
                    }
                } catch (e) { console.error(e); }
            }
            // Fallback search
            if (!data.imageUrl) {
                const fallbackData = await getProductLink({ link: urlToAnalyze });
                if (fallbackData.imageUrl) {
                    data.imageUrl = fallbackData.imageUrl;
                    if (!data.title) data.title = fallbackData.title;
                    if (!data.brand) data.brand = fallbackData.brand;
                }
            }
        }

        // Fetch image blob
        let imgBlob: Blob;
        if (data.imageBase64) {
            const base64Response = await fetch(data.imageBase64);
            imgBlob = await base64Response.blob();
        } else if (data.imageUrl) {
            try {
                const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(data.imageUrl)}`;
                const proxyResponse = await fetch(proxyUrl);
                if (!proxyResponse.ok) throw new Error("Proxy failed");
                imgBlob = await proxyResponse.blob();
            } catch (e) {
                throw new Error("Failed to fetch image");
            }
        } else {
            throw new Error("No image found");
        }

        const imgFile = new File([imgBlob], "product.jpg", { type: imgBlob.type });

        // Analyze with Gemini
        const apiKey = profile.gemini_api_key || localStorage.getItem("gemini_api_key");
        if (!apiKey) throw new Error("API Key required");

        const analysis = await analyzeLinkWithGemini(urlToAnalyze, data, imgFile, apiKey, profile.location, wardrobeItems);

        const previewData: WardrobeItemAnalysis = {
            ...analysis,
            image_url: URL.createObjectURL(imgBlob),
            item_name: data.title || analysis.item_name,
            description: data.description || analysis.description,
            brand: data.brand || analysis.brand,
            price: data.price || analysis.price,
            color: analysis.primary_color || data.color,
        };

        try {
            const linkData = await getProductLink({
                brand: previewData.brand,
                name: previewData.item_name || previewData.sub_category,
                color: previewData.color || previewData.primary_color
            });
            previewData.product_link = linkData.url;
        } catch (e) { }

        return previewData;
    };

    const handleLinkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const interval = simulateProgress();
        setPreview(null);

        const taskId = `task-${Date.now()}`;
        const taskPromise = performAnalysis(url);

        // Start background task
        startTask(taskId, 'analysis', `Analyzing ${new URL(url).hostname}...`, taskPromise);

        try {
            // We await it here too for immediate feedback if user stays
            const result = await taskPromise;
            setPreview(result);
            setProgress(100);
        } catch (err) {
            console.error(err);
            toast.error("Analysis Failed");
        } finally {
            clearInterval(interval);
            setLoading(false);
        }
    };



    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Fetch wardrobe items for complementary suggestions
        const fetchWardrobe = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from('wardrobe_items')
                    .select('sub_category, category, primary_color')
                    .eq('user_id', user.id)
                    .limit(50); // Limit to prevent huge prompts

                if (error) {
                    console.error('Failed to fetch wardrobe - Full error:', error);
                    console.error('Error details:', {
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                        code: error.code
                    });
                    return;
                }

                if (data) {
                    setWardrobeItems(data.map(item => ({
                        name: item.sub_category || item.category,
                        category: item.category,
                        color: item.primary_color
                    })));
                }
            } catch (err) {
                console.error('Failed to fetch wardrobe:', err);
            }
        };

        fetchWardrobe();
    }, []);

    // Global Paste Listener
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (activeTab !== 'upload' || preview || loading) return;

            const items = e.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    if (blob) {
                        const file = new File([blob], "pasted-image.png", { type: blob.type });
                        const mockEvent = {
                            target: { files: [file] }
                        } as unknown as React.ChangeEvent<HTMLInputElement>;
                        handleFileUpload(mockEvent);
                        toast.success("Image pasted from clipboard!");
                    }
                    break;
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [activeTab, preview, loading]);

    const saveDetails = async () => {
        if (!preview) return;
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/auth/login");
                return;
            }

            // Upload Image to Storage if it's a blob
            let finalImageUrl = preview.image_url;
            if (preview.image_url?.startsWith('blob:')) {
                const blob = await fetch(preview.image_url).then(r => r.blob());
                const fileName = `${user.id}/${Date.now()}.jpg`;
                const { error: uploadError } = await supabase.storage
                    .from('wardrobe_items')
                    .upload(fileName, blob);

                if (uploadError) throw uploadError;

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('wardrobe_items')
                    .getPublicUrl(fileName);

                finalImageUrl = publicUrl;
            }

            // Save to Database
            const { error: dbError } = await supabase.from('wardrobe_items').insert({
                user_id: user.id,
                image_url: finalImageUrl,
                category: preview.category,
                sub_category: preview.sub_category,
                brand: preview.brand,
                primary_color: preview.primary_color,
                price_estimate: preview.price_estimate,
                description: preview.description,
                style_tags: preview.style_tags,
                style_score: preview.style_score,
                ai_analysis: preview // Store full analysis json
            });

            if (dbError) throw dbError;

            // Success
            toast.success("Item added to wardrobe!");
            router.push("/wardrobe");
        } catch (error) {
            console.error("Save Error:", error);
            toast.error("Save Failed", { description: (error as Error).message || "Failed to save item. Please try again.", duration: 5000 });
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
                {/* Loading Skeleton & Progress */}
                {loading && (
                    <div className="w-full relative">
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 text-center bg-black/50 backdrop-blur-sm rounded-xl">
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
                        <AddItemSkeleton />
                    </div>
                )}

                {/* Saving Overlay */}
                {saving && (
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                        <Loader2 size={48} className="text-primary animate-spin mb-4" />
                        <h3 className="text-xl font-bold mb-2 text-white">Saving to Wardrobe...</h3>
                    </div>
                )}

                {/* Input Modes (Hidden when preview is active or loading) */}
                {!preview && !loading && activeTab === 'upload' && (
                    <div className="w-full text-center max-w-md animate-fade-in">
                        <div
                            className="border-2 border-dashed border-white/20 rounded-3xl h-80 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group relative overflow-hidden"
                            onClick={() => document.getElementById('file-input')?.click()}
                        >
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Upload size={32} className="text-gray-400 group-hover:text-primary transition-colors" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Drop your image here</h3>
                            <p className="text-gray-400 text-sm max-w-xs">Paste (Ctrl+V) or click to browse</p>
                            <p className="text-xs text-gray-500 mt-2">Supports JPG, PNG, WEBP up to 5MB</p>

                            <input id="file-input" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e)} />
                        </div>
                    </div>
                )}

                {!preview && !loading && activeTab === 'link' && (
                    <form onSubmit={handleLinkSubmit} className="w-full max-w-md space-y-6 animate-fade-in">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                                <LinkIcon size={32} className="text-primary" />
                            </div>
                            <h3 className="text-xl font-bold">Import from URL</h3>
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
                                    <Image
                                        src={preview.image_url}
                                        alt="Product"
                                        fill
                                        className="object-cover"
                                    />
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
                                        &quot;<GlossaryText text={preview.description} />&quot;
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
                                            {(() => {
                                                const colorValue = preview.color || preview.primary_color || '#FFFFFF';
                                                // Extract hex code if format is "ColorName #HEX"
                                                const hexMatch = colorValue.match(/#[0-9A-Fa-f]{6}/);
                                                const hexCode = hexMatch ? hexMatch[0] : colorValue.startsWith('#') ? colorValue : '#FFFFFF';
                                                const colorName = colorValue.replace(/#[0-9A-Fa-f]{6}/, '').trim() || colorValue;

                                                return (
                                                    <>
                                                        <span className="w-4 h-4 rounded-full border border-white/30 shadow-sm" style={{ backgroundColor: hexCode }}></span>
                                                        {colorName}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <a
                                        href={activeTab === 'link' && url ? url : preview.product_link || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-2 underline underline-offset-4"
                                        onClick={(e) => {
                                            if (!preview.product_link && activeTab !== 'link') {
                                                e.preventDefault();
                                                toast.error("Link not available yet");
                                            }
                                        }}
                                    >
                                        <LinkIcon size={14} /> Product Link
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

export default function AddItemPage() {
    return (
        <Suspense fallback={<AddItemSkeleton />}>
            <AddItemContent />
        </Suspense>
    );
}

