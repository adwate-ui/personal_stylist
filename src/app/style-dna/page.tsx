"use client";

import { useState, useEffect } from "react";
import { Sparkles, Heart, TrendingUp, Briefcase, ShoppingBag, Loader2, AlertCircle, Palette } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { getBrandSearchUrl, getProductImagePlaceholder, getFirstSearchResultUrl } from "@/lib/product-links";

export default function StyleDNAPage() {
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
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
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

                    {/* Model Attribution */}
                    {styleDNA.generated_by_model && (
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm">
                            <span className="text-gray-400">Generated by:</span>
                            <span className="text-primary font-medium">
                                {styleDNA.generated_by_model === 'gemini-3-pro-preview' && 'Gemini 3 Pro Preview'}
                                {styleDNA.generated_by_model === 'gemini-2.5-pro' && 'Gemini 2.5 Pro'}
                                {styleDNA.generated_by_model === 'gemini-3-flash-preview' && 'Gemini 3 Flash Preview'}
                                {styleDNA.generated_by_model === 'gemini-2.5-flash' && 'Gemini 2.5 Flash'}
                                {!['gemini-3-pro-preview', 'gemini-2.5-pro', 'gemini-3-flash-preview', 'gemini-2.5-flash'].includes(styleDNA.generated_by_model) && styleDNA.generated_by_model}
                            </span>
                            <a
                                href="/onboarding?mode=regenerate"
                                className="ml-2 text-xs px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-full transition-colors"
                            >
                                Regenerate ↻
                            </a>
                        </div>
                    )}
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

                {/* 3-Column Layout for Main Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                                        <div className="flex gap-2 flex-wrap">
                                            {styleDNA.color_palette.neutrals.map((c: string, i: number) => (
                                                <div key={i} className="w-12 h-12 rounded-lg border border-white/20 shadow-lg" style={{ backgroundColor: c }} title={c} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {styleDNA.color_palette.accents && Array.isArray(styleDNA.color_palette.accents) && (
                                    <div>
                                        <label className="text-sm text-gray-400 block mb-3">Accent Colors</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {styleDNA.color_palette.accents.map((c: string, i: number) => (
                                                <div key={i} className="w-12 h-12 rounded-lg border border-white/20 shadow-lg" style={{ backgroundColor: c }} title={c} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Avoid Colors */}
                            {styleDNA.color_palette.avoid && Array.isArray(styleDNA.color_palette.avoid) && styleDNA.color_palette.avoid.length > 0 && (
                                <div className="mb-6 pt-6 border-t border-white/10">
                                    <label className="text-sm text-gray-400 block mb-3">Colors to Avoid</label>
                                    <div className="flex gap-3 flex-wrap">
                                        {styleDNA.color_palette.avoid.map((item: any, i: number) => {
                                            const colorName = typeof item === 'string' ? item : item.color;
                                            const reason = typeof item === 'object' ? item.reason : '';
                                            return (
                                                <div key={i} className="relative group">
                                                    <div className="w-12 h-12 rounded-lg border-2 border-red-500/50 bg-white/5 flex items-center justify-center">
                                                        <span className="text-red-400 text-2xl">×</span>
                                                    </div>
                                                    {reason && (
                                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                                            {reason}
                                                        </div>
                                                    )}
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
                                                const productUrl = data?.url || getBrandSearchUrl(item.brand || '', item.item);
                                                const imageUrl = data?.imageUrl;
                                                const icon = getProductImagePlaceholder(item.item);

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
                                    return Object.entries(essentials).map(([category, productTypes]: [string, any]) => {
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

                                                    return (
                                                        <div key={type} className="mb-6 last:mb-0">
                                                            <h5 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
                                                                {type.replace(/_/g, ' ')}
                                                            </h5>

                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                {items.map((item: any, i: number) => {
                                                                    const key = `${item.brand || ''}-${item.item}`;
                                                                    const data = productData.get(key);
                                                                    const productUrl = data?.url || item.product_url || getBrandSearchUrl(item.brand || '', item.item);
                                                                    const imageUrl = data?.imageUrl || item.image_url;
                                                                    const icon = getProductImagePlaceholder(item.item);

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
                                    });
                                }

                                return null;
                            })()}
                        </div>
                    )}

                    {/* Column 3: Brand Recommendations + Styling Wisdom */}
                    <div className="space-y-8">
                        {/* Brand Recommendations */}
                        {styleDNA.brand_recommendations && Array.isArray(styleDNA.brand_recommendations) && styleDNA.brand_recommendations.length > 0 && (
                            <div className="card glass p-8">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Briefcase className="text-primary" /> Recommended Brands
                                </h3>
                                <div className="space-y-4">
                                    {styleDNA.brand_recommendations.map((brand: { name: string; tier: string; why?: string }, i: number) => (
                                        <div key={i} className="bg-white/5 p-4 rounded-lg border border-white/10 hover:border-primary/30 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-bold">{brand.name}</div>
                                                <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">{brand.tier}</span>
                                            </div>
                                            {brand.why && <p className="text-sm text-gray-400">{brand.why}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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
        </div>
    );
}
