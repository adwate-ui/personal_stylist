"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@supabase/supabase-js';

export default function LoginPage() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-2">
            <div className="w-full max-w-md p-8 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold mb-2">Welcome Back</h1>
                    <p className="text-gray-400">Sign in to access your personal stylist.</p>
                </div>

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
                    providers={['google', 'apple']}
                    redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
                />
            </div>
        </div>
    );
}
