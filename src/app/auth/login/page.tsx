"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();

    useEffect(() => {
        // Only set up auth listener if Supabase is properly configured
        if (!isSupabaseConfigured) {
            return;
        }

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN') {
                router.push('/onboarding');
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-2">
            <div className="w-full max-w-md p-8 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 relative mx-auto mb-4">
                        <img src="/icon.png" alt="AURUM" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-3xl font-serif font-bold mb-2 tracking-widest">AURUM</h1>
                    <p className="text-gray-400 text-sm tracking-wide uppercase">Personal Styling Intelligence</p>
                </div>

                {!isSupabaseConfigured ? (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                        <h3 className="text-red-400 font-bold mb-2">Configuration Required</h3>
                        <p className="text-gray-300 text-sm mb-4">
                            Supabase environment variables are not configured. Please set up your environment variables to enable authentication.
                        </p>
                        <div className="text-left bg-black/40 rounded-lg p-4 text-xs font-mono">
                            <p className="text-gray-400 mb-2">Required variables:</p>
                            <p className="text-gray-300">NEXT_PUBLIC_SUPABASE_URL</p>
                            <p className="text-gray-300">NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
                        </div>
                        <p className="text-gray-400 text-xs mt-4">
                            See <code className="bg-black/40 px-2 py-1 rounded">.env.example</code> for details.
                        </p>
                    </div>
                ) : (
                    <Auth
                        supabaseClient={supabase}
                        appearance={{
                            theme: ThemeSupa,
                            variables: {
                                default: {
                                    colors: {
                                        brand: '#d4af37',
                                        brandAccent: '#b5952f',
                                        inputBackground: 'transparent',
                                        inputText: 'white',
                                        inputBorder: '#333',
                                        inputBorderFocus: '#d4af37',
                                        inputBorderHover: '#666',
                                    },
                                    radii: {
                                        borderRadiusButton: '0.75rem',
                                        inputBorderRadius: '0.75rem',
                                    }
                                }
                            },
                            className: {
                                container: 'w-full',
                                button: '!font-bold !py-3',
                                label: '!text-gray-400 !text-xs !uppercase !tracking-wider',
                                input: '!bg-white/5 !border-white/10 !text-white placeholder:!text-gray-600',
                            }
                        }}
                        providers={[]}
                        redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
                    />
                )}
            </div>
        </div>
    );
}
