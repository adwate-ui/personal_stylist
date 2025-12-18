"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Sparkles, Loader2, AlertCircle, LayoutGrid, List, Layers, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { WardrobeItem } from "@/types/wardrobe";
import { useProfile } from "@/hooks/useProfile";
import { getBrandSearchUrl } from "@/lib/product-links";
import { formatPrice } from "@/lib/currency";

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
                </div>
            </div>
        ))}
    </>
);

const CATEGORY_GROUPS: Record<string, string[]> = {
    'Shirts': ['shirt', 'blouse', 'top', 'polo'],
    'Suits': ['suit', 'blazer', 'sport coat'],
    'Trousers': ['trouser', 'pant', 'slacks', 'chino'],
    'Jeans': ['jean', 'denim'],
    'Jackets': ['jacket', 'coat', 'outerwear', 'parka', 'bomber'],
    'Coats': ['coat', 'overcoat', 'trench'],
    'Shoes': ['shoe', 'sneaker', 'boot', 'loafer', 'oxford', 'heel', 'flat', 'sandal'],
    'Accessories': ['accessory', 'pocket square', 'scarf', 'hat', 'cap', 'glove'],
    'Ties': ['tie', 'bow tie', 'necktie'],
    'Belts': ['belt'],
    'Watches': ['watch', 'timepiece'],
    'Socks': ['sock', 'hosiery'],
    'Dresses': ['dress', 'gown'],
    'Skirts': ['skirt'],
    'Activewear': ['activewear', 'sportswear', 'athletic', 'gym', 'workout'],
};

const getMasterCategory = (itemCategory: string, itemSubCategory?: string) => {
    // Combine category and sub-category for better matching
    const searchText = `${itemCategory || ''} ${itemSubCategory || ''} `.toLowerCase();

    // Check specific lists first - order matters for specificity
    const orderedGroups = [
        'Watches', 'Socks', 'Ties', 'Belts', 'Suits', 'Jeans',
        'Trousers', 'Shirts', 'Dresses', 'Skirts', 'Coats',
        'Jackets', 'Shoes', 'Accessories', 'Activewear'
    ];

    for (const group of orderedGroups) {
        const keywords = CATEGORY_GROUPS[group];
        if (keywords && keywords.some(keyword => searchText.includes(keyword))) {
            return group;
        }
    }

    // Fallback to 'Other'
    return 'Other';
};

export default function WardrobePage() {
    const [items, setItems] = useState<WardrobeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [groupByCategory, setGroupByCategory] = useState(true);
    const [gridSize, setGridSize] = useState<'4x4' | '5x5' | '6x6'>('4x4');

    const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    const { profile } = useProfile();

    // Initial load of preferences
    useEffect(() => {
        const savedView = localStorage.getItem('wardrobe_view_mode');
        const savedGrid = localStorage.getItem('wardrobe_grid_size');
        if (savedView === 'grid' || savedView === 'list') {
            setViewMode(savedView);
        }
        if (savedGrid === '4x4' || savedGrid === '5x5' || savedGrid === '6x6') {
            setGridSize(savedGrid as '4x4' | '5x5' | '6x6');
        }
    }, []);

    // Save preference when changed
    const handleSetViewMode = (mode: 'grid' | 'list') => {
        setViewMode(mode);
        localStorage.setItem('wardrobe_view_mode', mode);
    }

    const handleSetGridSize = (size: '4x4' | '5x5' | '6x6') => {
        setGridSize(size);
        localStorage.setItem('wardrobe_grid_size', size);
    }

    const fetchItems = async (pageNum = 1, isLoadMore = false) => {
        if (!isLoadMore) {
            setLoading(true);
            setError(null);
        } else {
            setLoadingMore(true);
        }

        try {
            // Check authentication first
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                if (isLoadMore) {
                    setHasMore(false);
                    return;
                }
                setItems([]);
                setLoading(false);
                return;
            }

            const limit = 20;
            const from = (pageNum - 1) * limit;
            const to = from + limit - 1;

            const { data, error: dbError, count } = await supabase
                .from('wardrobe_items')
                .select('*', { count: 'exact' })
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .range(from, to);

            if (dbError) throw new Error(dbError.message);

            const fetchedItems = data || [];

            if (isLoadMore) {
                setItems(prev => [...prev, ...fetchedItems]);
            } else {
                setItems(fetchedItems);
                if (fetchedItems.length > 0 && !isLoadMore && pageNum === 1) {
                    // toast.success("Wardrobe updated"); // Optional: removed to reduce noise
                }
            }

            setHasMore((count || 0) > to + 1);
            setPage(pageNum);
        } catch (err) {
            console.error(err);
            if (!isLoadMore) {
                setError((err as Error).message || "Failed to load wardrobe items");
            } else {
                toast.error("Failed to load more items", { description: (err as Error).message });
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        // Separate effect for initial fetch to avoid double-firing if we were using StrictMode (though we are likely not)
        fetchItems();
    }, []);

    const handleRetry = () => fetchItems();

    const handleLoadMore = () => {
        fetchItems(page + 1, true);
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        setDeleting(true);
        try {
            const { error } = await supabase.from('wardrobe_items').delete().eq('id', id);
            if (error) throw error;

            setItems(prev => prev.filter(i => i.id !== id));
            setSelectedItem(null); // Close modal
            toast.success("Item deleted");
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete item", { description: (err as Error).message });
        } finally {
            setDeleting(false);
        }
    };

    const groupedItems = items.reduce((acc, item) => {
        const group = groupByCategory
            ? getMasterCategory(item.category, item.sub_category)
            : 'All Items';

        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
    }, {} as Record<string, WardrobeItem[]>);

    // Sort groups ensures consistent order
    const sortedGroups = Object.keys(groupedItems).sort();

    return (
        <div className="min-h-screen p-8 pb-20 relative">
            {/* Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedItem(null)}>
                    <div className="bg-[#121212] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={(e) => { e.stopPropagation(); setSelectedItem(null); }}
                            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors z-10"
                        >
                            <X size={24} />
                        </button>

                        <div className="w-full md:w-1/2 bg-[#050505] relative min-h-[300px] md:min-h-full">
                            <img
                                src={selectedItem.image_url || "/placeholder-garment.jpg"}
                                alt={selectedItem.name}
                                className="w-full h-full object-contain"
                            />
                        </div>

                        <div className="w-full md:w-1/2 p-8 space-y-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    {selectedItem.brand && (
                                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium tracking-wider text-gray-400 uppercase">
                                            {selectedItem.brand}
                                        </span>
                                    )}
                                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium tracking-wider text-gray-400 uppercase">
                                        {selectedItem.category}
                                    </span>
                                </div>
                                <h2 className="text-3xl font-serif font-bold text-white mb-2">{selectedItem.name}</h2>
                                {selectedItem.style_score && (
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="flex bg-white/5 rounded-lg p-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Sparkles key={i} size={14} className={i < Math.round((selectedItem.style_score || 0) / 2) ? "text-[#d4af37]" : "text-gray-700"} />
                                            ))}
                                        </div>
                                        <span className="text-[#d4af37] font-bold">{selectedItem.style_score}/10 Match</span>
                                    </div>
                                )}

                                {/* Price and Link Section */}
                                <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                                    {selectedItem.price && profile?.location && (
                                        <div className="text-2xl font-bold text-primary">
                                            {formatPrice(selectedItem.price, profile.location)}
                                        </div>
                                    )}
                                    {(selectedItem.brand || selectedItem.name) && (
                                        <a
                                            href={getBrandSearchUrl(selectedItem.brand || '', selectedItem.name || '')}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-primary px-6 py-2 text-sm flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="9" cy="9" r="7" />
                                                <path d="m21 21-4.35-4.35" />
                                            </svg>
                                            Find Similar Items
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Analysis</h3>
                                    <p className="text-gray-400 leading-relaxed text-sm">
                                        {selectedItem.ai_analysis?.description || selectedItem.description || "No specific analysis available."}
                                    </p>
                                </div>

                                {selectedItem.ai_analysis?.styling_tips && selectedItem.ai_analysis.styling_tips.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Styling Tips</h3>
                                        <ul className="space-y-2">
                                            {selectedItem.ai_analysis.styling_tips.map((tip: string, i: number) => (
                                                <li key={i} className="flex gap-3 text-sm text-gray-300">
                                                    <span className="text-primary mt-1">•</span>
                                                    <span>{tip}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {selectedItem.ai_analysis?.complementary_items && selectedItem.ai_analysis.complementary_items.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <span className="text-primary">✨</span> Pairs Well With
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {selectedItem.ai_analysis.complementary_items.map((item: string, i: number) => (
                                                <div key={i} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 hover:bg-white/10 hover:border-primary/30 transition-all cursor-default flex items-center gap-2">
                                                    <span className="text-primary text-lg">+</span>
                                                    <span>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Price and Shop Link */}
                            <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-white/10">
                                {selectedItem.price && (
                                    <div className="text-2xl font-bold text-primary">
                                        {formatPrice(selectedItem.price, profile.location)}
                                    </div>
                                )}
                                {(selectedItem.brand || selectedItem.name) && (
                                    <a
                                        href={getBrandSearchUrl(selectedItem.brand || '', selectedItem.name || '')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary px-4 py-2 text-sm flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="9" cy="9" r="7" />
                                            <path d="m21 21-4.35-4.35" />
                                        </svg>
                                        Shop {selectedItem.brand || 'Similar'}
                                    </a>
                                )}
                            </div>

                            <div className="pt-8 border-t border-white/10 flex justify-between items-center">
                                <div className="text-xs text-gray-500">
                                    Added {new Date(selectedItem.created_at).toLocaleDateString()}
                                </div>
                                <button
                                    onClick={() => handleDeleteItem(selectedItem.id)}
                                    disabled={deleting}
                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    {deleting ? <Loader2 className="animate-spin" size={16} /> : <><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg> Delete Item</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-bold mb-2 font-serif">My Wardrobe</h1>
                    <p className="text-gray-400">Digitize and organize your style.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                        <button
                            onClick={() => setGroupByCategory(!groupByCategory)}
                            className={`p - 2 rounded - md transition - all flex items - center gap - 2 text - sm ${groupByCategory ? 'bg-primary text-black shadow-lg' : 'text-gray-400 hover:text-white'} `}
                            title="Group by Category"
                        >
                            <Layers size={18} />
                            <span className="hidden sm:inline">Groups</span>
                        </button>
                    </div>

                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                        <button
                            onClick={() => handleSetViewMode('grid')}
                            className={`p - 2 rounded - md transition - all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'} `}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => handleSetViewMode('list')}
                            className={`p - 2 rounded - md transition - all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'} `}
                        >
                            <List size={18} />
                        </button>
                    </div>

                    {viewMode === 'grid' && (
                        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                            <button
                                onClick={() => handleSetGridSize('4x4')}
                                className={`px - 3 py - 2 rounded - md transition - all text - xs font - medium ${gridSize === '4x4' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'} `}
                            >
                                4×4
                            </button>
                            <button
                                onClick={() => handleSetGridSize('5x5')}
                                className={`px - 3 py - 2 rounded - md transition - all text - xs font - medium ${gridSize === '5x5' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'} `}
                            >
                                5×5
                            </button>
                            <button
                                onClick={() => handleSetGridSize('6x6')}
                                className={`px - 3 py - 2 rounded - md transition - all text - xs font - medium ${gridSize === '6x6' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'} `}
                            >
                                6×6
                            </button>
                        </div>
                    )}

                    <Link href="/add-item" className="btn btn-primary">
                        <Plus size={20} className="mr-2" /> <span className="hidden sm:inline">Add Item</span>
                    </Link>
                </div>
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
                        <div className="space-y-12">
                            {sortedGroups.map(group => (
                                <div key={group} className="animate-fade-in">
                                    {groupByCategory && (
                                        <h2 className="text-2xl font-serif font-bold mb-6 border-b border-white/10 pb-2 flex items-center gap-2">
                                            {group} <span className="text-xs font-sans font-normal text-gray-500 bg-white/5 px-2 py-1 rounded-full">{groupedItems[group].length}</span>
                                        </h2>
                                    )}

                                    <div className={viewMode === 'grid' ? `grid - gallery - ${gridSize} ` : "space-y-4"}>
                                        {groupedItems[group].map((item) => (
                                            viewMode === 'grid' ? (
                                                <div
                                                    key={item.id}
                                                    className="card group relative cursor-pointer active:scale-95 transition-transform"
                                                    onClick={() => setSelectedItem(item)}
                                                >
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
                                                            {item.brand && (
                                                                <span className="text-xs border border-white/20 px-2 py-1 rounded-full capitalize bg-white/5">
                                                                    {item.brand}
                                                                </span>
                                                            )}
                                                            {item.season && (
                                                                <span className="text-xs border border-white/20 px-2 py-1 rounded-full capitalize">
                                                                    {item.season}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Hover Overlay */}
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm pointer-events-none">
                                                        <Sparkles size={24} className="text-[#d4af37] mb-2" />
                                                        <p className="text-sm font-medium">
                                                            {item.ai_analysis?.styling_tips?.[0] || item.critique || "View details for styling tips"}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    key={item.id}
                                                    className="card p-4 flex gap-6 items-center hover:bg-white/5 transition-colors group cursor-pointer"
                                                    onClick={() => setSelectedItem(item)}
                                                >
                                                    <div className="w-24 h-32 shrink-0 bg-gray-800 rounded-lg overflow-hidden">
                                                        <img
                                                            src={item.image_url || "/placeholder-garment.jpg"}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h3 className="font-bold text-xl capitalize truncate">
                                                                {item.name || item.sub_category || item.category}
                                                            </h3>
                                                            {item.style_score && (
                                                                <span className={`text - sm font - bold px - 3 py - 1 rounded - full ${item.style_score > 80 ? 'bg-green-500/20 text-green-400' : 'bg-white/10'} `}>
                                                                    {item.style_score}/10
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-400 mb-3 line-clamp-1">
                                                            {item.description || item.ai_analysis?.description}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {item.brand && <span className="badge badge-outline">{item.brand}</span>}
                                                            {item.category && <span className="badge badge-outline">{item.category}</span>}
                                                            {item.color && <span className="badge badge-outline">{item.color}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        ))}
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
