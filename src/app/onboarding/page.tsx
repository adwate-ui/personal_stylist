"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, ChevronRight, Check } from "lucide-react";

export default function Onboarding() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        gender: "",
        height: "",
        weight: "",
        styleGoals: [] as string[],
        avatar: null as File | null,
    });

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const styles = ["Minimalist", "Streetwear", "Classic", "Bohemian", "Business", "Avant-Garde"];

    const toggleStyle = (style: string) => {
        setFormData(prev => ({
            ...prev,
            styleGoals: prev.styleGoals.includes(style)
                ? prev.styleGoals.filter(s => s !== style)
                : [...prev.styleGoals, style]
        }));
    };

    const handleFinish = async () => {
        // TODO: Submit to Supabase
        console.log("Submitting:", formData);
        router.push("/wardrobe");
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
            <div className="w-full max-w-lg">
                {/* Progress */}
                <div className="flex justify-between mb-8 opacity-50 text-sm">
                    <span>Step {step} of 3</span>
                    <span>{Math.round((step / 3) * 100)}%</span>
                </div>

                <div className="card p-8 glass animate-fade-in shadow-2xl">
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold">Tell us about you</h2>
                            <p className="text-gray-400">We need a few details to perfectly tailor your recommendations.</p>

                            <div>
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Jane Doe"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label>Height (cm)</label>
                                    <input
                                        type="number"
                                        placeholder="175"
                                        value={formData.height}
                                        onChange={e => setFormData({ ...formData, height: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label>Weight (kg)</label>
                                    <input
                                        type="number"
                                        placeholder="70"
                                        value={formData.weight}
                                        onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button className="btn btn-primary w-full" onClick={handleNext}>
                                Continue <ChevronRight size={20} className="ml-2" />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold">Define your style</h2>
                            <p className="text-gray-400">Select the aesthetics that resonate with you.</p>

                            <div className="grid grid-cols-2 gap-3">
                                {styles.map(style => (
                                    <button
                                        key={style}
                                        onClick={() => toggleStyle(style)}
                                        className={`p-4 rounded-xl border text-left transition-all ${formData.styleGoals.includes(style)
                                                ? 'border-[#d4af37] bg-[rgba(212,175,55,0.1)] text-[#d4af37]'
                                                : 'border-white/10 hover:bg-white/5'
                                            }`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-4">
                                <button className="btn btn-outline flex-1" onClick={handleBack}>Back</button>
                                <button className="btn btn-primary flex-1" onClick={handleNext}>Continue</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold">Your Look</h2>
                            <p className="text-gray-400">Upload a photo to help AI understand your body type (optional).</p>

                            <div className="border-2 border-dashed border-white/20 rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-[#d4af37]/50 transition-colors bg-white/5">
                                <Upload size={48} className="text-gray-500 mb-4" />
                                <span className="text-gray-400">Click to upload photo</span>
                                {/* Input would go here */}
                            </div>

                            <button className="btn btn-primary w-full" onClick={handleFinish}>
                                Complete Profile <Check size={20} className="ml-2" />
                            </button>
                            <button className="btn btn-outline w-full mt-2" onClick={handleBack}>Back</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
