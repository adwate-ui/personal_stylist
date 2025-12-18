"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const code = searchParams.get('code');
        const next = searchParams.get('next') || '/onboarding';

        if (code) {
            supabase.auth.exchangeCodeForSession(code).then(async ({ data, error }) => {
                if (!error && data.session) {
                    // Check if profile exists AND has completed onboarding (has styleDNA)
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('id, style_dna')
                        .eq('id', data.session.user.id)
                        .single();

                    if (profile && profile.style_dna) {
                        // Profile exists and onboarding complete
                        router.push('/wardrobe');
                    } else {
                        // New user or incomplete onboarding
                        router.push(next); // Defaults to /onboarding
                    }
                } else {
                    console.error('Auth error:', error);
                    router.push('/auth/login?error=auth_failed');
                }
            });
        } else {
            router.push('/auth/login');
        }
    }, [router, searchParams]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h2 className="text-xl font-serif mb-4">Verifying...</h2>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CallbackContent />
        </Suspense>
    );
}
