"use client";

import { useProfile } from "@/hooks/useProfile";
import { Sparkles, Palette, Shirt, Briefcase, Loader2, AlertCircle } from "lucide-react";
import { Check } from "lucide-react";

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
                        Your Style DNA hasn't been created yet. Complete your onboarding to generate your unique style profile.
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
                                            {styleDNA.color_palette.avoid.map((c: string, i: number) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs"
                                                >
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Wardrobe Essentials */}
                    {styleDNA.must_have_staples && styleDNA.must_have_staples.length > 0 && (
                        <div className="card glass p-8">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Shirt className="text-primary" /> Wardrobe Essentials
                            </h3>
                            <ul className="space-y-4">
                                {styleDNA.must_have_staples.map((item: any, i: number) => (
                                    <li key={i} className="flex gap-3 items-start">
                                        <Check size={18} className="text-primary mt-1 shrink-0" />
                                        <div>
                                            <div className="font-bold">{item.item}</div>
                                            {item.why && (
                                                <div className="text-sm text-gray-400">{item.why}</div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Brand Recommendations */}
                    {styleDNA.brand_recommendations && styleDNA.brand_recommendations.length > 0 && (
                        <div className="card glass p-8">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Briefcase className="text-primary" /> Recommended Brands
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {styleDNA.brand_recommendations.map((brand: any, i: number) => (
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
                            <ul className="space-y-3">
                                {styleDNA.styling_tips.map((tip: string, i: number) => (
                                    <li
                                        key={i}
                                        className="text-gray-300 italic border-l-2 border-primary/30 pl-4 py-1"
                                    >
                                        "{tip}"
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
