"use strict";
"use client";

import { useState, useEffect } from "react";
import { Sparkles, ShoppingBag, Calendar, AlertCircle, Loader2, ExternalLink, ArrowRight } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import { generateWeeklyRecommendations } from "@/lib/gemini-client";
import { toast } from "sonner";
import { getProductLink, getBrandSearchUrl } from "@/lib/product-links";
import { fetchAllWardrobeItems } from "@/app/wardrobe/page";

interface ShoppingOption {
    brand: string;
    color: string;
    price_range_text: string;
    url?: string;
    imageUrl?: string;
}

interface Recommendation {
    item_name: string;
    priority: "High" | "Medium" | "Low";
    reason: string;
    options: ShoppingOption[];
}

// Helper to batch process links
const enrichRecommendations = async (recs: Recommendation[]): Promise<Recommendation[]> => {
    const enriched = await Promise.all(recs.map(async (rec) => {
        const enrichedOptions = await Promise.all(rec.options.map(async (opt) => {
            // If URL already exists and is valid, keep it
            if (opt.url && opt.url !== '#') return opt;

            try {
                const linkData = await getProductLink({
                    brand: opt.brand,
                    name: rec.item_name,
                    color: opt.color
                });
                return {
                    ...opt,
                    url: linkData.url,
                    imageUrl: linkData.imageUrl
                };
            } catch (e) {
                console.error(`Failed to resolve link for ${rec.item_name} ${opt.brand}`, e);
                return opt;
            }
        }));
        return { ...rec, options: enrichedOptions };
    }));
    return enriched;
};

interface ProductSearchLinkProps {
    item: string;
    brand: string;
    color: string;
    className?: string;
    children: React.ReactNode;
}

function ProductSearchLink({ item, brand, color, className, children }: ProductSearchLinkProps) {
    const [url, setUrl] = useState<string>("");

    useEffect(() => {
        let mounted = true;

        if (item === '#' || (brand === '#' && color === '#')) {
            // Special case for persisted links passed as props (hacky but effective if we refactor Usage)
            // Actually, the Component consumes item/brand/color props. 
            // We'll trust the parent passed the URL if available.
            return;
        }

        const resolveLink = async () => {
            // If we already have a direct link passed via a different prop (not currently possible with this signature), 
            // we'd use it. But here we are purely client-side fallback.

            // 1. Immediate fallback 
            const fallbackUrl = getBrandSearchUrl(brand, item);
            if (mounted) setUrl(fallbackUrl);

            // 2. Async optimized search (Only if we don't have a persisted URL from parent - handled in parent now)
            try {
                const result = await getProductLink({
                    brand,
                    name: item,
                    color
                });

                if (mounted && result.url && result.url !== '#') {
                    setUrl(result.url);
                }
            } catch (e) {
                // Keep fallback
            }
        };

        resolveLink();

        return () => { mounted = false; };
    }, [item, brand, color]);

    return (
        <a
            href={url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
            onClick={(e) => {
                if (!url) e.preventDefault();
            }}
        >
            {children}
        </a>
    );
}

export default function RecommendationsPage() {
    const { profile, loading: profileLoading } = useProfile();
    const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        let mounted = true;

        const fetchRecommendations = async () => {
            if (!profile) return;
            try {
                if (mounted) setLoading(true);
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const weekStart = getWeekStartDate();

                // Try to find existing for this week
                const { data, error } = await supabase
                    .from('weekly_recommendations')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('week_start_date', weekStart)
                    .maybeSingle();

                if (data && data.recommendations) {
                    if (mounted) {
                        setRecommendations(data.recommendations);
                        setLoading(false);
                    }
                } else {
                    // If not found, generating new one
                    if (mounted) await generateNew(user.id, weekStart);
                }
            } catch (error) {
                console.error('Error fetching recommendations:', error);
                if (mounted) setLoading(false);
            }
        };

        if (!profileLoading && profile) {
            fetchRecommendations();
        } else if (!profileLoading && !profile) {
            if (mounted) setLoading(false);
        }

        return () => { mounted = false; };
    }, [profile, profileLoading]);

    const getWeekStartDate = () => {
        const d = new Date();
        d.setUTCHours(0, 0, 0, 0);
        d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1)); // Monday
        return d.toISOString().split('T')[0];
    };



    const generateNew = async (userId: string, weekStartDate: string) => {
        setGenerating(true);
        try {
            // 1. Fetch Wardrobe
            const wardrobeItems = await fetchAllWardrobeItems(userId);

            // 2. Get API Key
            const apiKey = profile?.gemini_api_key || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

            if (!apiKey) {
                console.error("API Key not found in profile or environment variables");
                throw new Error("API Key missing. Please check your configuration.");
            }

            // 3. Generate
            const newRecs = await generateWeeklyRecommendations(
                profile?.styleDNA,
                wardrobeItems,
                apiKey
            );

            if (!newRecs || !Array.isArray(newRecs)) throw new Error("Invalid AI response");

            // 4. Enrich with Links (Server-Side Logic simulation)
            // We do this BEFORE saving so the links are persisted
            const enrichedRecs = await enrichRecommendations(newRecs);

            // 5. Save to DB
            const { error } = await supabase
                .from('weekly_recommendations')
                .upsert({
                    user_id: userId,
                    week_start_date: weekStartDate,
                    recommendations: enrichedRecs
                }, { onConflict: 'user_id,week_start_date' });

            if (error) throw error;

            setRecommendations(enrichedRecs);

        } catch (error) {
            console.error("Failed to generate recommendations:", error);
            toast.error("Failed to generate recommendations. Please try again.");
        } finally {
            setGenerating(false);
            setLoading(false);
        }
    };

    const regenerateLinks = async () => {
        if (!recommendations || !profile) return;
        setGenerating(true);
        toast.info("Updating product links...");

        try {
            const enriched = await enrichRecommendations(recommendations);

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const weekStart = getWeekStartDate();
                const { error } = await supabase
                    .from('weekly_recommendations')
                    .update({ recommendations: enriched })
                    .eq('user_id', user.id)
                    .eq('week_start_date', weekStart);

                if (error) throw error;
                setRecommendations(enriched);
                toast.success("Links updated successfully");
            }
        } catch (error) {
            console.error("Failed to update links:", error);
            toast.error("Failed to update links");
        } finally {
            setGenerating(false);
        }
    };

    const regeneratePicks = async () => {
        if (!confirm("This will replace your current weekly picks with new ones. Continue?")) return;
        if (!profile) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await generateNew(user.id, getWeekStartDate());
        }
    };



    if (profileLoading || loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <Loader2 size={48} className="text-primary animate-spin" />
                {generating && (
                    <p className="text-gray-400 animate-pulse">Analyzing your wardrobe gaps...</p>
                )}
            </div>
        );
    }

    if (!profile?.styleDNA) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="glass p-8 rounded-xl text-center max-w-md border border-yellow-500/30">
                    <AlertCircle className="mx-auto mb-4 text-yellow-400" size={48} />
                    <h3 className="text-xl font-bold mb-2">Style DNA Required</h3>
                    <p className="text-gray-400 mb-6">
                        We need your Style DNA to identify what&apos;s missing.
                    </p>
                    <a href="/onboarding" className="btn btn-primary">
                        create Style DNA
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6 lg:p-12 pb-24">
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">

                {/* Header */}
                <div className="text-center space-y-4 pt-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20">
                        <Calendar size={12} />
                        Week of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold">Weekly Picks</h1>
                    <p className="text-gray-400 max-w-xl mx-auto">
                        Curated shopping recommendations to fill the critical gaps in your wardrobe, based on your unique Style DNA.
                    </p>

                    {/* Controls */}
                    <div className="flex justify-center gap-3 pt-2">
                        <button
                            onClick={regenerateLinks}
                            disabled={generating || !recommendations}
                            className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            <ExternalLink size={12} /> Refresh Link
                        </button>
                        <button
                            onClick={regeneratePicks}
                            disabled={generating}
                            className="text-xs px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-full transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            <Sparkles size={12} /> New Picks
                        </button>
                    </div>
                </div>

                {/* Recommendations Grid */}
                <div className="grid grid-cols-1 gap-8">
                    {recommendations?.map((rec, i) => (
                        <div key={i} className="card glass p-0 overflow-hidden border border-white/5 hover:border-primary/30 transition-all">
                            <div className="p-6 md:p-8 border-b border-white/5 bg-white/[0.02]">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-2xl font-bold text-white">{rec.item_name}</h2>
                                            {rec.priority === 'High' && (
                                                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded border border-red-500/30 uppercase tracking-wider">
                                                    High Priority
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
                                            {rec.reason}
                                        </p>
                                    </div>
                                    <div className="shrink-0 bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center text-primary">
                                        <ShoppingBag size={24} />
                                    </div>
                                </div>
                            </div>

                            {/* Shopping Options */}
                            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
                                {rec.options.map((option, idx) => (
                                    <div key={idx} className="p-6 hover:bg-white/[0.02] transition-colors group relative">
                                        <div className="mb-4">
                                            <h3 className="font-semibold text-lg mb-1">{option.brand}</h3>
                                            <p className="text-sm text-gray-400">{option.color}</p>
                                        </div>

                                        <div className="flex items-end justify-between mt-auto">
                                            <span className="text-sm font-mono text-primary/80">{option.price_range_text}</span>
                                            {option.url && option.url !== '#' ? (
                                                <a
                                                    href={option.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs flex items-center gap-1 text-white opacity-60 group-hover:opacity-100 hover:text-primary transition-all"
                                                >
                                                    Buy Now <ArrowRight size={12} />
                                                </a>
                                            ) : (
                                                <ProductSearchLink
                                                    item={rec.item_name}
                                                    brand={option.brand}
                                                    color={option.color}
                                                    className="text-xs flex items-center gap-1 text-white opacity-60 group-hover:opacity-100 hover:text-primary transition-all"
                                                >
                                                    Search <ArrowRight size={12} />
                                                </ProductSearchLink>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {(!recommendations || recommendations.length === 0) && !generating && (
                    <div className="text-center py-20 opacity-50">
                        <p>No recommendations generated yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
