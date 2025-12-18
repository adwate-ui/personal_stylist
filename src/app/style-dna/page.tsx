"use client";

import { useState, useEffect } from "react";
import { Sparkles, Heart, TrendingUp, Briefcase, ShoppingBag, Loader2, AlertCircle, Palette } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { getBrandSearchUrl, getProductImagePlaceholder } from "@/lib/product-links";

export default function StyleDNAPage() {
    const { profile, loading } = useProfile();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={48} className="text-primary animate-spin" />
            </div>
        );
    }

    const styleDNA = profile.styleDNA;

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
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                <div className="text-center space-y-4 pt-10">
                    <Sparkles size={48} className="text-primary mx-auto animate-pulse" />
                    <h1 className="text-5xl font-serif font-bold">Your Style DNA</h1>
                    <p className="text-xl text-primary font-mono tracking-widest uppercase">
                        {styleDNA.archetype_name || "Personal Style Profile"}
                    </p>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        {styleDNA.summary || "Your unique style identity, crafted from your preferences and lifestyle."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Color Palette */}
                    {styleDNA.color_palette && (
                        <div className="card glass p-8">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Palette className="text-primary" /> Signature Palette
                            </h3>
                            <div className="space-y-6">
                                {styleDNA.color_palette.neutrals && styleDNA.color_palette.neutrals.length > 0 && (
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">
                                            Neutrals
                                        </label>
                                        <div className="flex gap-3">
                                            {styleDNA.color_palette.neutrals.map((c: string, i: number) => (
                                                <div
                                                    key={i}
                                                    className="w-12 h-12 rounded-full border border-white/20 shadow-lg"
                                                    style={{ backgroundColor: c }}
                                                    title={c}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {styleDNA.color_palette.accents && styleDNA.color_palette.accents.length > 0 && (
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">
                                            Accents
                                        </label>
                                        <div className="flex gap-3">
                                            {styleDNA.color_palette.accents.map((c: string, i: number) => (
                                                <div
                                                    key={i}
                                                    className="w-12 h-12 rounded-full border border-white/20 shadow-lg"
                                                    style={{ backgroundColor: c }}
                                                    title={c}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {styleDNA.color_palette.avoid && styleDNA.color_palette.avoid.length > 0 && (
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">
                                            Avoid
                                        </label>
                                        <div className="flex gap-2 flex-wrap">
                                            {styleDNA.color_palette.avoid.map((item: any, i: number) => (
                                                <div key={i} className="relative group">
                                                    <div
                                                        className="w-12 h-12 rounded-full border-2 border-red-500/50 opacity-50 relative"
                                                        style={{ backgroundColor: typeof item === 'string' ? item : item.color }}
                                                    >
                                                        <div className="absolute inset-0 flex items-center justify-center text-red-500 text-2xl font-bold">×</div>
                                                    </div>
                                                    {typeof item === 'object' && item.reason && (
                                                        <div className="absolute hidden group-hover:block bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-2 rounded whitespace-nowrap z-10">
                                                            {item.reason}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Seasonal Variations */}
                                {styleDNA.color_palette.seasonal_variations && (
                                    <div className="mt-6 pt-6 border-t border-white/10">
                                        <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                            <span>🌸</span> Seasonal Palette
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {styleDNA.color_palette.seasonal_variations.spring_summer && (
                                                <div>
                                                    <label className="text-xs text-gray-400 block mb-2">Spring/Summer</label>
                                                    <div className="flex gap-2">
                                                        {styleDNA.color_palette.seasonal_variations.spring_summer.map((c: string, i: number) => (
                                                            <div key={i} className="w-10 h-10 rounded-lg border border-white/10" style={{ backgroundColor: c }} title={c} />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {styleDNA.color_palette.seasonal_variations.fall_winter && (
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
                                        <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                            <span>🎨</span> Color Science
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            {styleDNA.color_palette.color_theory.skin_undertone && (
                                                <div>
                                                    <div className="text-xs text-gray-400 mb-1">Skin Undertone</div>
                                                    <div className="font-medium capitalize">{styleDNA.color_palette.color_theory.skin_undertone}</div>
                                                </div>
                                            )}
                                            {styleDNA.color_palette.color_theory.best_metal && (
                                                <div>
                                                    <div className="text-xs text-gray-400 mb-1">Best Metal</div>
                                                    <div className="font-medium capitalize flex items-center gap-2">
                                                        <span>{styleDNA.color_palette.color_theory.best_metal}</span>
                                                        {styleDNA.color_palette.color_theory.best_metal.includes('gold') && <span>✨</span>}
                                                        {styleDNA.color_palette.color_theory.best_metal.includes('silver') && <span>💎</span>}
                                                        {styleDNA.color_palette.color_theory.best_metal.includes('rose') && <span>🌹</span>}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {styleDNA.color_palette.color_theory.complementary_colors && styleDNA.color_palette.color_theory.complementary_colors.length > 0 && (
                                            <div className="mt-4">
                                                <div className="text-xs text-gray-400 mb-2">Complementary Colors</div>
                                                <div className="flex gap-2">
                                                    {styleDNA.color_palette.color_theory.complementary_colors.map((c: string, i: number) => (
                                                        <div key={i} className="w-8 h-8 rounded border border-white/10" style={{ backgroundColor: c }} title={c} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Wardrobe Essentials - Product Type View */}
                    {styleDNA.must_have_staples && (
                        <div className="card glass p-8">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <ShoppingBag className="text-primary" /> Wardrobe Essentials
                            </h3>

                            {Object.entries(styleDNA.must_have_staples).map(([category, productTypes]: [string, any]) => (
                                <div key={category} className="mb-8 last:mb-0">
                                    <h4 className="text-lg font-semibold mb-4 capitalize border-b border-white/10 pb-2">
                                        {category.replace('_', ' ')}
                                    </h4>

                                    {Object.entries(productTypes).map(([type, items]: [string, any]) => (
                                        <div key={type} className="mb-6 last:mb-0">
                                            <h5 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
                                                {type.replace('_', ' ')}
                                            </h5>

                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {items.map((item: any, i: number) => {
                                                    const productUrl = item.product_url || getBrandSearchUrl(item.brand || '', item.item);
                                                    const icon = getProductImagePlaceholder(item.item);

                                                    return (
                                                        <div key={i} className="bg-white/5 rounded-xl border border-white/5 hover:border-primary/30 transition-all group overflow-hidden">
                                                            {/* Product Image/Icon */}
                                                            <a
                                                                href={productUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="block relative overflow-hidden bg-white/10 aspect-square"
                                                            >
                                                                {item.image_url ? (
                                                                    <img
                                                                        src={item.image_url}
                                                                        alt={item.item}
                                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                    />
                                                                ) : (
                                                                    <div className="absolute inset-0 flex items-center justify-center text-5xl">
                                                                        {icon}
                                                                    </div>
                                                                )}
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <span className="text-xs text-white font-medium">Shop at {item.brand || 'stores'} →</span>
                                                                </div>
                                                            </a>

                                                            {/* Product Info */}
                                                            <div className="p-3">
                                                                <div className="font-bold text-sm mb-1 line-clamp-1">{item.item}</div>
                                                                {item.brand && (
                                                                    <div className="text-xs text-primary mb-1">@ {item.brand}</div>
                                                                )}
                                                                {item.why && (
                                                                    <div className="text-xs text-gray-400 line-clamp-2 mb-2">{item.why}</div>
                                                                )}
                                                                <a
                                                                    href={productUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs text-primary hover:underline flex items-center gap-1"
                                                                >
                                                                    Shop Now →
                                                                </a>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Brand Recommendations */}
                    {styleDNA.brand_recommendations && styleDNA.brand_recommendations.length > 0 && (
                        <div className="card glass p-8">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Briefcase className="text-primary" /> Recommended Brands
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {styleDNA.brand_recommendations.map((brand: { name: string; tier: string; why?: string }, i: number) => (
                                    <div
                                        key={i}
                                        className="bg-white/5 p-4 rounded-xl border border-white/5"
                                    >
                                        <div className="font-bold text-lg mb-1">{brand.name}</div>
                                        <div className="text-xs text-primary mb-2 uppercase tracking-wider">
                                            {brand.tier}
                                        </div>
                                        {brand.why && (
                                            <div className="text-sm text-gray-400">{brand.why}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Styling Tips */}
                    {styleDNA.styling_tips && styleDNA.styling_tips.length > 0 && (
                        <div className="card glass p-8">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Sparkles className="text-primary" /> Styling Wisdom
                            </h3>
                            <div className="space-y-4">
                                {styleDNA.styling_tips.map((tip: string, i: number) => (
                                    <div
                                        key={i}
                                        className="bg-primary/5 border border-primary/20 rounded-xl p-4 hover:bg-primary/10 transition-all group"
                                    >
                                        <div className="flex gap-3 items-start">
                                            <span className="text-primary text-2xl group-hover:scale-110 transition-transform">💡</span>
                                            <p className="text-gray-300 italic flex-1">
                                                &quot;{tip}&quot;
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
