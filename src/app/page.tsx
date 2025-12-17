import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden bg-[#0a0a0a]">
      {/* Background Gradient Blob */}
      <div
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, rgba(0,0,0,0) 70%)' }}
      />

      <div className="z-10 text-center max-w-2xl animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm text-primary">
          <Sparkles size={16} />
          <span>Your AI-Powered Personal Stylist</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold font-serif mb-6 tracking-tight leading-tight">
          Elevate Your <span className="text-primary italic">Style</span><br />
          Effortlessly.
        </h1>

        <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-lg mx-auto">
          The world's most advanced stylist, powered by Gemini 3.
          Curate your wardrobe, get personalized scores, and shop with confidence.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/login" className="btn btn-primary text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
            Start Your Style Journey
          </Link>
          <Link href="/auth/login" className="btn btn-outline">
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
