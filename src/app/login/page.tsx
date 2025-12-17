"use client";

import { createClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-black">
            <div className="w-full max-w-md bg-zinc-900 p-8 rounded-xl shadow-xl border border-zinc-800">
                <h1 className="text-2xl font-serif text-[#d4af37] mb-6 text-center">Sign In</h1>
                <Auth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    theme="dark"
                    providers={['google', 'github']}
                    redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
                />
            </div>
        </div>
    );
}
