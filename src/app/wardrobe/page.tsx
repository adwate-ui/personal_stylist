"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Sparkles, Loader2, AlertCircle, LayoutGrid, List, Layers, X, ShoppingBag, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { WardrobeItem } from "@/types/wardrobe";
import { useProfile } from "@/hooks/useProfile";
import { getBrandSearchUrl, getFirstSearchResultUrl } from "@/lib/product-links";
import { formatPrice } from "@/lib/currency";
import { getBrandTier, getSimilarBrands } from "@/lib/brand-tiers";

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
    const [wardrobeNames, setWardrobeNames] = useState<string[]>([]);

    const { profile } = useProfile();
    const router = useRouter();

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
                                <div className="space-y-3 pb-4 border-b border-white/10">
                                    {/* Price Display */}
                                    {(selectedItem.price || selectedItem.ai_analysis?.price || selectedItem.ai_analysis?.price_estimate) && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400 text-sm">Price:</span>
                                            <div className="text-xl font-bold text-primary">
                                                {selectedItem.price
                                                    ? (profile?.location ? formatPrice(selectedItem.price, profile.location) : `Rs. ${selectedItem.price}`)
                                                    : (selectedItem.ai_analysis?.price || selectedItem.ai_analysis?.price_estimate)}
                                            </div>
                                        </div>
                                    )}

                                    {/* Product URL Link - Smart fetch if missing */}
                                    {(selectedItem.link || selectedItem.brand || selectedItem.name) && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400 text-sm">Product Link:</span>
                                            {selectedItem.link ? (
                                                <a
                                                    href={selectedItem.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:text-primary/80 text-sm underline underline-offset-2 flex items-center gap-1"
                                                >
                                                    View Product <ExternalLink size={12} />
                                                </a>
                                            ) : (
                                                <button
                                                    onClick={async () => {
                                                        const color = selectedItem.color || selectedItem.ai_analysis?.primary_color;
                                                        const data = await getFirstSearchResultUrl(
                                                            selectedItem.brand || '',
                                                            selectedItem.name || selectedItem.sub_category || '',
                                                            color
                                                        );
                                                        window.open(data.url, '_blank');
                                                    }}
                                                    className="text-primary hover:text-primary/80 text-sm underline underline-offset-2 flex items-center gap-1"
                                                >
                                                    Find Product <ExternalLink size={12} />
                                                </button>
                                            )}
                                        </div>
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

                                {/* Pairs Well With - From Inventory */}
                                {(() => {
                                    const complementaryMap: Record<string, string[]> = {
                                        'Shirts': ['Trousers', 'Jeans', 'Suits', 'Ties', 'Belts'],
                                        'Suits': ['Shirts', 'Ties', 'Belts', 'Shoes'],
                                        'Trousers': ['Shirts', 'Jackets', 'Belts', 'Shoes'],
                                        'Jeans': ['Shirts', 'Jackets', 'Shoes'],
                                        'Jackets': ['Shirts', 'Trousers', 'Jeans'],
                                        'Shoes': ['Trousers', 'Jeans', 'Suits'],
                                        'Ties': ['Shirts', 'Suits', 'Jackets'],
                                        'Belts': ['Trousers', 'Jeans', 'Suits'],
                                        'Dresses': ['Shoes', 'Accessories', 'Jackets'],
                                        'Skirts': ['Shirts', 'Jackets', 'Shoes']
                                    };
                                    const category = getMasterCategory(selectedItem.category, selectedItem.sub_category);
                                    const pairsWith = items.filter(item => {
                                        if (item.id === selectedItem.id) return false;
                                        const cat = getMasterCategory(item.category, item.sub_category);
                                        return (complementaryMap[category] || []).includes(cat);
                                    }).slice(0, 6);
                                    if (pairsWith.length === 0) return null;
                                    return (
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                                <span className="text-primary">✨</span> Pairs Well With
                                            </h3>
                                            <div className="grid grid-cols-2 gap-2">
                                                {pairsWith.map((item) => (
                                                    <div key={item.id} onClick={() => setSelectedItem(item)} className="bg-white/5 border border-white/10 rounded-lg p-2 hover:bg-white/10 hover:border-primary/30 transition-all cursor-pointer">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-12 h-16 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                                                                <img src={item.image_url || "/placeholder-garment.jpg"} alt={item.name} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-xs font-medium text-white truncate">{item.name || item.sub_category}</div>
                                                                <div className="text-xs text-gray-400 truncate">{item.brand || item.category}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Similar Products Section */}
                            <div className="pb-4 border-b border-white/10">
                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                    <ShoppingBag size={16} className="text-primary" />
                                    Similar Items from {getBrandTier(selectedItem.brand || '')} Brands
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {(() => {
                                        const tier = getBrandTier(selectedItem.brand || '');
                                        const similarBrands = getSimilarBrands(selectedItem.brand || '', tier);
                                        const brands = Array.isArray(similarBrands) ? similarBrands : [];

                                        return brands.slice(0, 6).map((brand, idx) => (
                                            <a
                                                key={idx}
                                                href={getBrandSearchUrl(brand, selectedItem.sub_category || selectedItem.category)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 transition-all group"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-sm">{brand}</span>
                                                    <ExternalLink size={14} className="text-gray-400 group-hover:text-primary" />
                                                </div>
                                                <div className="text-xs text-gray-400 capitalize">
                                                    {selectedItem.sub_category || selectedItem.category}
                                                </div>
                                            </a>
                                        ))
                                    })()}
                                </div>
                            </div>

                            {/* Model Attribution */}
                            {(selectedItem.generated_by_model || selectedItem.ai_analysis?.generated_by_model) && (
                                <div className="pt-4 border-t border-white/10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-gray-500">Analysis by:</span>
                                            <span className="text-primary font-medium">
                                                {(() => {
                                                    const model = selectedItem.generated_by_model || selectedItem.ai_analysis?.generated_by_model;
                                                    if (model === 'gemini-3-pro-preview') return 'Gemini 3 Pro';
                                                    if (model === 'gemini-2.5-pro') return 'Gemini 2.5 Pro';
                                                    if (model === 'gemini-3-flash-preview') return 'Gemini 3 Flash';
                                                    if (model === 'gemini-2.5-flash') return 'Gemini 2.5 Flash';
                                                    return model;
                                                })()}
                                            </span>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                // TODO: Implement regeneration API call
                                                toast.info('Regeneration feature coming soon!');
                                            }}
                                            className="text-xs px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-full transition-colors"
                                        >
                                            Regenerate ↻
                                        </button>
                                    </div>
                                </div>
                            )}

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

            <header className="mb-12 flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-4xl font-bold">Wardrobe</h1>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* View Mode - Modern Segmented Control */}
                    <div className="inline-flex bg-white/5 rounded-lg p-1 border border-white/10">
                        <button
                            onClick={() => handleSetViewMode('grid')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${viewMode === 'grid'
                                ? 'bg-primary text-black shadow-lg'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <LayoutGrid size={16} />
                            <span className="hidden sm:inline">Grid</span>
                        </button>
                        <button
                            onClick={() => handleSetViewMode('list')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${viewMode === 'list'
                                ? 'bg-primary text-black shadow-lg'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <List size={16} />
                            <span className="hidden sm:inline">List</span>
                        </button>
                    </div>

                    {/* Grid Size - Only in grid mode */}
                    {viewMode === 'grid' && (
                        <div className="inline-flex bg-white/5 rounded-lg p-1 border border-white/10">
                            {(['4x4', '5x5', '6x6'] as const).map((size) => (
                                <button
                                    key={size}
                                    onClick={() => handleSetGridSize(size)}
                                    className={`px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${gridSize === size
                                        ? 'bg-white/10 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Group Toggle - Modern Switch */}
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={groupByCategory}
                            onChange={(e) => setGroupByCategory(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        <span className="ml-3 text-sm font-medium text-gray-400 hidden md:inline">Group</span>
                    </label>

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

                                    <div className={viewMode === 'grid' ? `grid-gallery-${gridSize}` : "space-y-4"}>
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
