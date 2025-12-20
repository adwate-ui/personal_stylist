"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Heart, TrendingUp, Briefcase, ShoppingBag, Loader2, AlertCircle, Palette, ChevronDown, ChevronUp } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { getBrandSearchUrl, getProductImagePlaceholder, getFirstSearchResultUrl } from "@/lib/product-links";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Helper function to convert hex to approximate color name
function hexToColorName(hex: string): string {
    const colorMap: Record<string, string> = {
        '#000000': 'Black', '#FFFFFF': 'White', '#808080': 'Gray',
        '#FF0000': 'Red', '#00FF00': 'Green', '#0000FF': 'Blue',
        '#FFFF00': 'Yellow', '#FF00FF': 'Magenta', '#00FFFF': 'Cyan',
        '#FFA500': 'Orange', '#800080': 'Purple', '#FFC0CB': 'Pink',
        '#A52A2A': 'Brown', '#FFD700': 'Gold', '#C0C0C0': 'Silver',
        '#8B4513': 'Saddle Brown', '#2E8B57': 'Sea Green', '#4B0082': 'Indigo',
        '#FF6347': 'Tomato', '#40E0D0': 'Turquoise', '#EE82EE': 'Violet',
        '#F0E68C': 'Khaki', '#E6E6FA': 'Lavender', '#FAEBD7': 'Antique White',
        '#F5F5DC': 'Beige', '#DEB887': 'Burlywood', '#5F9EA0': 'Cadet Blue',
        '#7FFF00': 'Chartreuse', '#D2691E': 'Chocolate', '#FF7F50': 'Coral',
        '#6495ED': 'Cornflower Blue', '#DC143C': 'Crimson', '#00008B': 'Dark Blue',
        '#008B8B': 'Dark Cyan', '#B8860B': 'Dark Goldenrod', '#A9A9A9': 'Dark Gray',
        '#006400': 'Dark Green', '#BDB76B': 'Dark Khaki', '#8B008B': 'Dark Magenta',
        '#556B2F': 'Dark Olive Green', '#FF8C00': 'Dark Orange', '#9932CC': 'Dark Orchid'
    };

    const upperHex = hex.toUpperCase();
    if (colorMap[upperHex]) return colorMap[upperHex];

    // Enhanced approximation based on RGB values
    if (hex.startsWith('#') && hex.length === 7) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        // Determine brightness
        const brightness = (r + g + b) / 3;
        const isDark = brightness < 85;
        const isLight = brightness > 170;

        // Determine dominant color
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;

        // Low saturation = grayscale
        if (saturation < 0.1) {
            if (isDark) return 'Charcoal';
            if (isLight) return 'Light Gray';
            return 'Gray';
        }

        // Determine hue-based color with brightness modifier
        const prefix = isDark ? 'Dark ' : isLight ? 'Light ' : '';

        if (r > g && r > b) {
            if (g > b) return prefix + 'Orange';
            return prefix + 'Red';
        }
        if (g > r && g > b) {
            if (b > r) return prefix + 'Teal';
            return prefix + 'Green';
        }
        if (b > r && b > g) {
            if (r > g) return prefix + 'Purple';
            return prefix + 'Blue';
        }
    }

    return hex; // Fallback to hex
}

export default function StyleDNAPage() {
    const router = useRouter();
    const { profile, loading } = useProfile();
    const [productData, setProductData] = useState<Map<string, { url: string; imageUrl?: string }>>(new Map());
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

    const styleDNA = profile?.styleDNA;

    // Fetch product URLs and images for wardrobe items
    // IMPORTANT: This useEffect must be called before any conditional returns
    useEffect(() => {
        // Early return if no profile or styleDNA to prevent crash
        if (!profile || !styleDNA?.must_have_staples) return;

        const fetchProductData = async () => {
            const essentials = styleDNA.must_have_staples;
            const newData = new Map();

            // Handle array format
            if (Array.isArray(essentials)) {
                for (const item of essentials) {
                    const key = `${item.brand || ''}-${item.item}`;
                    try {
                        const data = await getFirstSearchResultUrl(item.brand || '', item.item, item.color || '');
                        newData.set(key, data);
                    } catch (error) {
                        console.error(`Failed to fetch product data for ${key}:`, error);
                    }
                }
            }

            // Handle object format
            if (typeof essentials === 'object' && essentials !== null) {
                for (const [category, productTypes] of Object.entries(essentials as object)) {
                    if (typeof productTypes !== 'object') continue;
                    for (const [type, items] of Object.entries(productTypes)) {
                        if (!Array.isArray(items)) continue;
                        for (const item of items) {
                            const key = `${item.brand || ''}-${item.item}`;
                            try {
                                const data = await getFirstSearchResultUrl(item.brand || '', item.item, item.color || '');
                                newData.set(key, data);
                            } catch (error) {
                                console.error(`Failed to fetch product data for ${key}:`, error);
                            }
                        }
                    }
                }
            }

            setProductData(newData);
        };

        fetchProductData();
    }, [profile, styleDNA]);

    // Conditional renders AFTER all hooks
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={48} className="text-primary animate-spin" />
            </div>
        );
    }

    if (!styleDNA) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="glass p-8 rounded-xl text-center max-w-md border border-yellow-500/30">
                    <AlertCircle className="mx-auto mb-4 text-yellow-400" size={48} />
                    <h3 className="text-xl font-bold mb-2">Style DNA Not Generated</h3>
                    <p className="text-gray-400 mb-6">
                        Your Style DNA hasn&apos;t been created yet. Complete your onboarding to generate your unique style profile.
                    </p>
                    <a href="/onboarding" className="btn btn-primary">
                        Complete Onboarding
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6 lg:p-12 overflow-y-auto pb-20">
            <div className="w-full max-w-[1600px] mx-auto space-y-8 animate-fade-in">
                {/* Header Section - Full Width */}
                <div className="text-center space-y-4 pt-10">
                    <Sparkles size={48} className="text-primary mx-auto animate-pulse" />
                    <h1 className="text-5xl font-serif font-bold">Your Style DNA</h1>
                    <p className="text-xl text-primary font-mono tracking-widest uppercase">
                        {styleDNA.archetype_name || "Personal Style Profile"}
                    </p>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        {styleDNA.summary || "Your unique style identity, crafted from your preferences and lifestyle."}
                    </p>

                    {/* Action Buttons */}
                    <div className="mt-4 flex flex-wrap gap-3 justify-center">
                        {styleDNA.generated_by_model && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm">
                                <span className="text-gray-400">Generated by:</span>
                                <span className="text-primary font-medium">
                                    {styleDNA.generated_by_model === 'gemini-3-pro-preview' && 'Gemini 3 Pro Preview'}
                                    {styleDNA.generated_by_model === 'gemini-2.5-pro' && 'Gemini 2.5 Pro'}
                                    {styleDNA.generated_by_model === 'gemini-3-flash-preview' && 'Gemini 3 Flash Preview'}
                                    {styleDNA.generated_by_model === 'gemini-2.5-flash' && 'Gemini 2.5 Flash'}
                                    {!['gemini-3-pro-preview', 'gemini-2.5-pro', 'gemini-3-flash-preview', 'gemini-2.5-flash'].includes(styleDNA.generated_by_model) && styleDNA.generated_by_model}
                                </span>
                            </div>
                        )}
                        <a
                            href="/onboarding?mode=regenerate"
                            className="text-xs px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-full transition-colors inline-flex items-center gap-1.5"
                            title="Generate new Style DNA with existing profile data"
                        >
                            Regenerate ↻
                        </a>
                        <button
                            onClick={async () => {
                                if (!confirm('This will clear your Style DNA and restart onboarding. Continue?')) return;

                                try {
                                    // Direct Supabase update (for static export compatibility)
                                    const { data: { user } } = await supabase.auth.getUser();
                                    if (!user) {
                                        toast.error('Please sign in to continue');
                                        return;
                                    }

                                    const { error } = await supabase
                                        .from('profiles')
                                        .update({ style_dna: null })
                                        .eq('id', user.id);

                                    if (error) throw error;

                                    toast.success('Style DNA cleared');
                                    router.push('/onboarding');
                                } catch (error) {
                                    console.error('Failed to reset onboarding:', error);
                                    toast.error('Failed to reset. Please try again.');
                                }
                            }}
                            className="text-xs px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-full transition-colors inline-flex items-center gap-1.5"
                            title="Clear Style DNA and restart from scratch"
                        >
                            Redo Onboarding ⟳
                        </button>
                    </div>
                </div>

                {/* Style Pillars - Full Width */}
                {styleDNA.style_pillars && Array.isArray(styleDNA.style_pillars) && styleDNA.style_pillars.length > 0 && (
                    <div className="card glass p-8">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Heart className="text-primary" /> Style Pillars
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {styleDNA.style_pillars.map((pillar: string, i: number) => (
                                <div key={i} className="bg-white/5 p-6 rounded-xl border border-white/10 text-center hover:border-primary/30 transition-all">
                                    <div className="text-3xl mb-3">✨</div>
                                    <div className="font-semibold">{pillar}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Responsive Layout for Main Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Column 1: Color Palette */}
                    {styleDNA.color_palette && (
                        <div className="card glass p-8">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Palette className="text-primary" /> Signature Palette
                            </h3>

                            {/* Neutrals and Accents */}
                            <div className="space-y-6 mb-6">
                                {styleDNA.color_palette.neutrals && Array.isArray(styleDNA.color_palette.neutrals) && (
                                    <div>
                                        <label className="text-sm text-gray-400 block mb-3">Your Neutrals</label>
                                        <div className="flex gap-3 flex-wrap">
                                            {styleDNA.color_palette.neutrals.map((c: any, i: number) => {
                                                const hexCode = typeof c === 'string' ? c : c.hex;
                                                const colorName = typeof c === 'object' && c.name ? c.name : hexToColorName(hexCode);
                                                return (
                                                    <div key={i} className="flex flex-col items-center gap-1 w-20">
                                                        <div
                                                            className="w-16 h-16 rounded-lg border border-white/20 shadow-lg"
                                                            style={{ backgroundColor: hexCode }}
                                                            title={`${colorName} (${hexCode})`}
                                                        />
                                                        <span className="text-xs text-gray-300 font-medium text-center max-w-20 break-words">{colorName}</span>
                                                        <span className="text-[10px] text-gray-500 font-mono">{hexCode}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {styleDNA.color_palette.accents && Array.isArray(styleDNA.color_palette.accents) && styleDNA.color_palette.accents.length > 0 && (
                                    <div>
                                        <label className="text-sm text-gray-400 block mb-3">Accent Colors</label>
                                        <div className="flex gap-3 flex-wrap">
                                            {styleDNA.color_palette.accents.map((c: any, i: number) => {
                                                const hexCode = typeof c === 'string' ? c : c.hex;
                                                const colorName = typeof c === 'object' && c.name ? c.name : hexToColorName(hexCode);
                                                return (
                                                    <div key={i} className="flex flex-col items-center gap-1 w-20">
                                                        <div
                                                            className="w-16 h-16 rounded-lg border border-white/20 shadow-lg"
                                                            style={{ backgroundColor: hexCode }}
                                                            title={`${colorName} (${hexCode})`}
                                                        />
                                                        <span className="text-xs text-gray-300 font-medium text-center max-w-20 break-words">{colorName}</span>
                                                        <span className="text-[10px] text-gray-500 font-mono">{hexCode}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Avoid Colors */}
                            {styleDNA.color_palette.avoid && Array.isArray(styleDNA.color_palette.avoid) && styleDNA.color_palette.avoid.length > 0 && (
                                <div className="mb-6 pt-6 border-t border-white/10">
                                    <label className="text-sm text-gray-400 block mb-3">Colors to Avoid</label>
                                    <div className="space-y-2">
                                        {styleDNA.color_palette.avoid.map((item: any, i: number) => {
                                            const colorName = typeof item === 'string' ? item : item.color;
                                            const reason = typeof item === 'object' ? item.reason : '';
                                            return (
                                                <div key={i} className="flex items-center gap-3 bg-white/5 p-2 rounded-lg">
                                                    <div className="relative">
                                                        <div className="w-10 h-10 rounded-lg border border-white/20 shadow-lg" style={{ backgroundColor: colorName }} />
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <span className="text-white text-xl font-bold drop-shadow-lg">×</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-white">{hexToColorName(colorName)}</div>
                                                        {reason && <div className="text-xs text-gray-400 mt-0.5">{reason}</div>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Seasonal Variations */}
                            {styleDNA.color_palette.seasonal_variations && (
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                        <span>🌸</span> Seasonal Palette
                                    </h4>
                                    <div className="space-y-4">
                                        {styleDNA.color_palette.seasonal_variations.spring_summer && Array.isArray(styleDNA.color_palette.seasonal_variations.spring_summer) && (
                                            <div>
                                                <label className="text-xs text-gray-400 block mb-2">Spring/Summer</label>
                                                <div className="flex gap-2">
                                                    {styleDNA.color_palette.seasonal_variations.spring_summer.map((c: string, i: number) => (
                                                        <div key={i} className="w-10 h-10 rounded-lg border border-white/10" style={{ backgroundColor: c }} title={c} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {styleDNA.color_palette.seasonal_variations.fall_winter && Array.isArray(styleDNA.color_palette.seasonal_variations.fall_winter) && (
                                            <div>
                                                <label className="text-xs text-gray-400 block mb-2">Fall/Winter</label>
                                                <div className="flex gap-2">
                                                    {styleDNA.color_palette.seasonal_variations.fall_winter.map((c: string, i: number) => (
                                                        <div key={i} className="w-10 h-10 rounded-lg border border-white/10" style={{ backgroundColor: c }} title={c} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Color Theory */}
                            {styleDNA.color_palette.color_theory && (
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <h4 className="text-sm font-semibold mb-4">Color Science</h4>
                                    <div className="space-y-3 text-sm">
                                        {styleDNA.color_palette.color_theory.skin_undertone && (
                                            <div>
                                                <label className="text-xs text-gray-400 block mb-1">Undertone</label>
                                                <div className="font-medium capitalize">{styleDNA.color_palette.color_theory.skin_undertone}</div>
                                            </div>
                                        )}
                                        {styleDNA.color_palette.color_theory.best_metal && (
                                            <div>
                                                <label className="text-xs text-gray-400 block mb-1">Best Metal</label>
                                                <div className="font-medium">
                                                    {styleDNA.color_palette.color_theory.best_metal === 'gold' && '✨ Gold'}
                                                    {styleDNA.color_palette.color_theory.best_metal === 'silver' && '💎 Silver'}
                                                    {styleDNA.color_palette.color_theory.best_metal === 'rose gold' && '🌹 Rose Gold'}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {styleDNA.color_palette.color_theory.complementary_colors && Array.isArray(styleDNA.color_palette.color_theory.complementary_colors) && (
                                        <div className="mt-4">
                                            <label className="text-xs text-gray-400 block mb-2">Complementary Colors</label>
                                            <div className="flex gap-2">
                                                {styleDNA.color_palette.color_theory.complementary_colors.map((c: string, i: number) => (
                                                    <div key={i} className="w-8 h-8 rounded-full border border-white/20" style={{ backgroundColor: c }} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Column 2: Wardrobe Essentials */}
                    {styleDNA.must_have_staples && (
                        <div className="card glass p-8 lg:col-span-1">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <ShoppingBag className="text-primary" /> Wardrobe Essentials
                            </h3>

                            {(() => {
                                const essentials = styleDNA.must_have_staples;

                                // Handle array format (old)
                                if (Array.isArray(essentials)) {
                                    return (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {essentials.map((item: any, i: number) => {
                                                const key = `${item.brand || ''}-${item.item}`;
                                                const data = productData.get(key);
                                                const productUrl = data?.url || '#';
                                                const imageUrl = data?.imageUrl;
                                                const icon = getProductImagePlaceholder(item.item);

                                                // Debug logging
                                                if (!imageUrl) console.log('Missing image for:', key, data);

                                                return (
                                                    <div key={i} className="bg-white/5 rounded-xl border border-white/5 hover:border-primary/30 transition-all group overflow-hidden">
                                                        <a href={productUrl} target="_blank" rel="noopener noreferrer" className="block relative overflow-hidden bg-white/10 aspect-square">
                                                            {imageUrl ? (
                                                                <img src={imageUrl} alt={item.item} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                            ) : (
                                                                <div className="absolute inset-0 flex items-center justify-center text-5xl">{icon}</div>
                                                            )}
                                                        </a>
                                                        <div className="p-3">
                                                            <div className="font-bold text-sm mb-1 line-clamp-1">{item.item}</div>
                                                            {item.brand && <div className="text-xs text-primary mb-1">@ {item.brand}</div>}
                                                            {item.color && <div className="text-xs text-gray-500 mb-1">Color: {item.color}</div>}
                                                            {item.why && <div className="text-xs text-gray-400 line-clamp-2">{item.why}</div>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                }

                                // Handle object format (new)
                                if (typeof essentials === 'object' && essentials !== null) {
                                    return Object.entries(essentials)
                                        .map(([category, productTypes]: [string, any]) => {
                                            if (!productTypes || typeof productTypes !== 'object') return null;
                                            const isCollapsed = collapsedCategories.has(category);

                                            return (
                                                <div key={category} className="mb-8 last:mb-0">
                                                    <h4
                                                        className="text-lg font-semibold mb-4 capitalize border-b border-white/10 pb-2 cursor-pointer flex justify-between items-center hover:text-primary transition-colors"
                                                        onClick={() => {
                                                            const newSet = new Set(collapsedCategories);
                                                            if (isCollapsed) {
                                                                newSet.delete(category);
                                                            } else {
                                                                newSet.add(category);
                                                            }
                                                            setCollapsedCategories(newSet);
                                                        }}
                                                    >
                                                        {category.replace(/_/g, ' ')}
                                                        <span className="text-sm">{isCollapsed ? '▶' : '▼'}</span>
                                                    </h4>

                                                    {!isCollapsed && Object.entries(productTypes).map(([type, items]: [string, any]) => {
                                                        if (!Array.isArray(items)) return null;

                                                        // valid types to show as headers (skip 'Essentials' or numeric indices)
                                                        const showHeader = type !== 'Essentials' && isNaN(parseInt(type));

                                                        return (
                                                            <div key={type} className="mb-6 last:mb-0">
                                                                {showHeader && (
                                                                    <h5 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
                                                                        {type.replace(/_/g, ' ')}
                                                                    </h5>
                                                                )}

                                                                {/* Use single column on lg screens to avoid squashed cards, 2 cols on mobile/tablet/xl */}
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                                                                    {items.map((item: any, i: number) => {
                                                                        const key = `${item.brand || ''}-${item.item}`;
                                                                        const data = productData.get(key);
                                                                        const productUrl = data?.url || item.product_url || '#';
                                                                        const imageUrl = data?.imageUrl || item.image_url;
                                                                        const icon = getProductImagePlaceholder(item.item);

                                                                        // Debug logging
                                                                        if (!imageUrl) console.log('Missing image for:', key, data);

                                                                        return (
                                                                            <div key={i} className="bg-white/5 rounded-xl border border-white/5 hover:border-primary/30 transition-all group overflow-hidden">
                                                                                <a href={productUrl} target="_blank" rel="noopener noreferrer" className="block relative overflow-hidden bg-white/10 aspect-square">
                                                                                    {imageUrl ? (
                                                                                        <img src={imageUrl} alt={item.item} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                                                    ) : (
                                                                                        <div className="absolute inset-0 flex items-center justify-center text-5xl">{icon}</div>
                                                                                    )}
                                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                        <span className="text-xs text-white font-medium">Shop at {item.brand || 'stores'} →</span>
                                                                                    </div>
                                                                                </a>
                                                                                <div className="p-3">
                                                                                    <div className="font-bold text-sm mb-1 line-clamp-1">{item.item}</div>
                                                                                    {item.brand && <div className="text-xs text-primary mb-1">@ {item.brand}</div>}
                                                                                    {item.color && <div className="text-xs text-gray-500 mb-1">Color: {item.color}</div>}
                                                                                    {item.why && <div className="text-xs text-gray-400 line-clamp-2 mb-2">{item.why}</div>}
                                                                                    <a href={productUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                                                                        Shop Now →
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })
                                        .filter(Boolean);
                                }

                                return null;
                            })()}
                        </div>
                    )}

                    {/* Column 3: Brand Recommendations + Styling Wisdom */}
                    <div className="space-y-8">


                        {/* Styling Wisdom */}
                        {styleDNA.styling_wisdom && Array.isArray(styleDNA.styling_wisdom) && styleDNA.styling_wisdom.length > 0 && (
                            <div className="card glass p-8">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <TrendingUp className="text-primary" /> Pro Styling Tips
                                </h3>
                                <div className="space-y-4">
                                    {styleDNA.styling_wisdom.map((tip: string, i: number) => (
                                        <div key={i} className="flex gap-4 bg-white/5 p-4 rounded-lg border border-white/10">
                                            <div className="text-primary text-xl flex-shrink-0">💡</div>
                                            <div className="text-sm text-gray-300">{tip}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
