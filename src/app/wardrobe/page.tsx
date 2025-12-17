"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Sparkles, Loader2, AlertCircle } from "lucide-react";

// Inline Skeleton Component
const WardrobeSkeleton = () => (
    <>
        {[...Array(8)].map((_, i) => (
            <div key={i} className="card relative animate-pulse">
                <div className="aspect-[3/4] bg-gray-800/50 rounded-t-xl" />
                <div className="p-4 space-y-3">
                    <div className="flex justify-between">
                        <div className="h-6 w-24 bg-gray-800/50 rounded" />
                        <div className="h-5 w-12 bg-gray-800/50 rounded" />
                    </div>
                    <div className="h-4 w-full bg-gray-800/50 rounded" />
                    <div className="flex gap-2">
                        <div className="h-6 w-16 bg-gray-800/50 rounded-full" />
                        <div className="h-6 w-16 bg-gray-800/50 rounded-full" />
                    </div>
                </div>
            </div>
        ))}
    </>
);

export default function WardrobePage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchItems = async (pageNum = 1, isLoadMore = false) => {
        if (!isLoadMore) {
            setLoading(true);
            setError(null);
        } else {
            setLoadingMore(true);
        }

        try {
            const res = await fetch(`/api/wardrobe/list?page=${pageNum}&limit=20`);
            if (!res.ok) throw new Error("Failed to fetch wardrobe items");

            const data = await res.json();

            if (isLoadMore) {
                setItems(prev => [...prev, ...data.items]);
            } else {
                setItems(data.items);
            }

            setHasMore(data.hasMore);
            setPage(pageNum);
        } catch (err: any) {
            console.error(err);
            if (!isLoadMore) {
                setError(err.message || "Failed to load wardrobe items");
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleRetry = () => fetchItems();

    const handleLoadMore = () => {
        fetchItems(page + 1, true);
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

            {error ? (
                <div className="glass p-8 rounded-xl text-center max-w-md mx-auto mt-20 border border-red-500/30">
                    <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
                    <h3 className="text-xl font-bold mb-2">Unavailable</h3>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={handleRetry}
                        className="btn bg-red-500/20 hover:bg-red-500/30 text-red-200 border-none"
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                <>
                    {items.length === 0 && !loading ? (
                        <div className="text-center py-20 opacity-30">
                            <Sparkles size={64} className="mx-auto mb-4" />
                            <p className="text-xl">Your wardrobe is empty. Start adding items!</p>
                        </div>
                    ) : (
                        <div className="grid-gallery">
                            {items.map((item) => (
                                <div key={item.id} className="card group relative">
                                    <div className="aspect-[3/4] overflow-hidden bg-gray-800">
                                        <img
                                            src={item.image_url || "/placeholder-garment.jpg"}
                                            alt={item.name || item.sub_category}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg capitalize truncate pr-2">
                                                {item.name || item.sub_category || item.category}
                                            </h3>
                                            {item.style_score && (
                                                <span className="bg-white/10 text-xs px-2 py-1 rounded whitespace-nowrap">
                                                    {item.style_score}/10
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                                            {item.description || item.ai_analysis?.description || "No description available"}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {item.season && (
                                                <span className="text-xs border border-white/20 px-2 py-1 rounded-full capitalize">
                                                    {item.season}
                                                </span>
                                            )}
                                            {item.color && (
                                                <span className="text-xs border border-white/20 px-2 py-1 rounded-full capitalize">
                                                    {item.color}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
                                        <Sparkles size={24} className="text-[#d4af37] mb-2" />
                                        <p className="text-sm font-medium">
                                            {item.ai_analysis?.styling_tips?.[0] || item.critique || "View details for styling tips"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {loading && <WardrobeSkeleton />}
                        </div>
                    )}

                    {hasMore && !loading && (
                        <div className="flex justify-center mt-12">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="btn btn-secondary min-w-[150px]"
                            >
                                {loadingMore ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" size={18} />
                                        Loading...
                                    </>
                                ) : (
                                    "Load More"
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
