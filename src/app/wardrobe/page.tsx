"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Sparkles, Loader2, AlertCircle, LayoutGrid, List, Layers } from "lucide-react";

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
    'Accessories': ['belt', 'tie', 'bow tie', 'pocket square', 'scarf', 'hat', 'cap', 'glove'],
    'Watches': ['watch', 'timepiece'],
    'Socks': ['sock', 'hosiery'],
    'Dresses': ['dress', 'gown'],
    'Skirts': ['skirt'],
    'Activewear': ['activewear', 'sportswear', 'athletic', 'gym', 'workout'],
};

const getMasterCategory = (itemCategory: string, itemSubCategory?: string, itemGender?: string) => {
    // Combine category and sub-category for better matching
    const searchText = `${itemCategory || ''} ${itemSubCategory || ''}`.toLowerCase();

    // Check specific lists first - order matters for specificity
    const orderedGroups = [
        'Watches', 'Socks', 'Ties', 'Belts', 'Suits', 'Jeans', 
        'Trousers', 'Shirts', 'Dresses', 'Skirts', 'Coats', 
        'Jackets', 'Shoes', 'Accessories', 'Activewear'
    ];

    for (const group of orderedGroups) {
        const keywords = CATEGORY_GROUPS[group];
        if (keywords.some(keyword => searchText.includes(keyword))) {
            return group;
        }
    }

    // Fallback to 'Other'
    return 'Other';
};

export default function WardrobePage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [groupByCategory, setGroupByCategory] = useState(true);
    const [gridSize, setGridSize] = useState<'4x4' | '5x5' | '6x6'>('4x4');

    const fetchItems = async (pageNum = 1, isLoadMore = false) => {
        if (!isLoadMore) {
            setLoading(true);
            setError(null);
        } else {
            setLoadingMore(true);
        }

        try {
            const res = await fetch(`/api/wardrobe/list?page=${pageNum}&limit=20`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || data.error || "Failed to fetch wardrobe items");

            if (isLoadMore) {
                setItems(prev => [...prev, ...data.items]);
            } else {
                setItems(data.items);
                // Subtle success toast only on initial load if items exist
                if (data.items.length > 0) {
                    toast.success("Wardrobe updated");
                }
            }

            setHasMore(data.hasMore);
            setPage(pageNum);
        } catch (err: any) {
            console.error(err);
            if (!isLoadMore) {
                setError(err.message || "Failed to load wardrobe items");
            } else {
                toast.error("Failed to load more items", { description: err.message });
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

    const groupedItems = items.reduce((acc, item) => {
        const group = groupByCategory
            ? getMasterCategory(item.category, item.sub_category, item.gender)
            : 'All Items';

        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
    }, {} as Record<string, any[]>);

    // Sort groups ensures consistent order
    const sortedGroups = Object.keys(groupedItems).sort();

    return (
        <div className="min-h-screen p-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-bold mb-2 font-serif">My Wardrobe</h1>
                    <p className="text-gray-400">Digitize and organize your style.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                        <button
                            onClick={() => setGroupByCategory(!groupByCategory)}
                            className={`p-2 rounded-md transition-all flex items-center gap-2 text-sm ${groupByCategory ? 'bg-primary text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            title="Group by Category"
                        >
                            <Layers size={18} />
                            <span className="hidden sm:inline">Groups</span>
                        </button>
                    </div>

                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>

                    {viewMode === 'grid' && (
                        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                            <button
                                onClick={() => setGridSize('4x4')}
                                className={`px-3 py-2 rounded-md transition-all text-xs font-medium ${gridSize === '4x4' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                4×4
                            </button>
                            <button
                                onClick={() => setGridSize('5x5')}
                                className={`px-3 py-2 rounded-md transition-all text-xs font-medium ${gridSize === '5x5' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                5×5
                            </button>
                            <button
                                onClick={() => setGridSize('6x6')}
                                className={`px-3 py-2 rounded-md transition-all text-xs font-medium ${gridSize === '6x6' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
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

                                    <div className={viewMode === 'grid' ? `grid-gallery-${gridSize}` : "space-y-4"}>
                                        {groupedItems[group].map((item: any) => (
                                            viewMode === 'grid' ? (
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
                                                <div key={item.id} className="card p-4 flex gap-6 items-center hover:bg-white/5 transition-colors group">
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
                                                                <span className={`text-sm font-bold px-3 py-1 rounded-full ${item.style_score > 80 ? 'bg-green-500/20 text-green-400' : 'bg-white/10'}`}>
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
