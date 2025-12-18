import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const redirectedFrom = requestUrl.searchParams.get("redirectedFrom") || "/onboarding";

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error("Auth Callback Error:", error);
            return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=callback_failed`);
        }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(`${requestUrl.origin}${redirectedFrom}`);
}
