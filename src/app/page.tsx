import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, rgba(0,0,0,0) 70%)' }}
      />

      <div className="z-10 text-center max-w-2xl animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm text-[#d4af37]">
          <Sparkles size={16} />
          <span>Your AI-Powered Personal Stylist</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
          Elevate Your <span style={{ color: 'var(--primary)' }}>Style</span><br />
          Effortlessly.
        </h1>

        <p className="text-xl text-gray-400 mb-10 leading-relaxed">
          The world's most advanced stylist, powered by Gemini 3.
          Curate your wardrobe, get personalized scores, and shop with confidence.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/onboarding" className="btn btn-primary">
            Get Started <ArrowRight size={20} className="ml-2" />
          </Link>
          <Link href="/auth/login" className="btn btn-outline">
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
