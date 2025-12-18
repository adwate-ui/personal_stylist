module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/supabase-config.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Shared Supabase configuration utilities
 */ // Fallback values for build time when environment variables are not available
__turbopack_context__.s([
    "isBrowser",
    ()=>isBrowser,
    "isSupabaseConfigured",
    ()=>isSupabaseConfigured,
    "supabaseKey",
    ()=>supabaseKey,
    "supabaseUrl",
    ()=>supabaseUrl
]);
const supabaseUrl = ("TURBOPACK compile-time value", "https://cumlbufsdynpoarkaxaz.supabase.co") || 'https://placeholder.supabase.co';
const supabaseKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1bWxidWZzZHlucG9hcmtheGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4ODc2MDMsImV4cCI6MjA4MTQ2MzYwM30.mM0Q9FgKWzI9Xnk8Ssm_7ZqR80jEqzWRgkcx2meRY_s") || 'placeholder-anon-key';
const isSupabaseConfigured = Boolean(("TURBOPACK compile-time value", "https://cumlbufsdynpoarkaxaz.supabase.co")) && Boolean(("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1bWxidWZzZHlucG9hcmtheGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4ODc2MDMsImV4cCI6MjA4MTQ2MzYwM30.mM0Q9FgKWzI9Xnk8Ssm_7ZqR80jEqzWRgkcx2meRY_s")) && !supabaseUrl.includes('placeholder');
const isBrowser = ("TURBOPACK compile-time value", "undefined") !== 'undefined';
}),
"[project]/src/lib/supabase.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createBrowserClient.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase-config.ts [app-ssr] (ecmascript)");
;
;
// Only warn in browser if Supabase is not configured (indicating a deployment issue)
// Suppress warning during build process to avoid confusion
if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"] && __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isBrowser"]) {
    console.warn('⚠️ Supabase is not configured. Authentication and database features will not work. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
}
// Create a proxy that throws helpful errors when not configured
const createSafeClient = ()=>{
    const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createBrowserClient"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabaseUrl"], __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabaseKey"]);
    // If running in browser with placeholder values, wrap the client
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isBrowser"] && !__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"]) {
        return new Proxy(client, {
            get (target, prop) {
                // Allow certain properties to be accessed for compatibility
                if (prop === 'auth' || prop === 'from' || prop === 'storage') {
                    const originalValue = target[prop];
                    if (typeof originalValue === 'object' && originalValue !== null) {
                        return new Proxy(originalValue, {
                            get (authTarget, authProp) {
                                // Throw error on actual API calls
                                const value = authTarget[authProp];
                                if (typeof value === 'function') {
                                    return function() {
                                        throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
                                    };
                                }
                                return value;
                            }
                        });
                    }
                    return originalValue;
                }
                return target[prop];
            }
        });
    }
    return client;
};
const supabase = createSafeClient();
;
}),
"[project]/src/hooks/useProfile.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useProfile",
    ()=>useProfile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase-config.ts [app-ssr] (ecmascript)");
"use client";
;
;
// Default empty profile
const DEFAULT_PROFILE = {
    name: "",
    avatar_url: "",
    gender: "",
    age: "",
    location: "New York, NY",
    height: "",
    weight: "",
    bodyShape: "",
    fitPreference: "regular",
    skinTone: "",
    eyeColor: "",
    hairColor: "",
    lifestyle: {
        work: false,
        casual: false,
        event: false,
        active: false
    },
    archetypes: [],
    brands: [],
    priceRange: "",
    styleReport: null,
    styleDNA: null
};
function useProfile() {
    const [profile, setProfile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(DEFAULT_PROFILE);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const loadProfileFromStorage = ()=>{
        const saved = localStorage.getItem('stylist_profile');
        if (saved) {
            try {
                setProfile({
                    ...DEFAULT_PROFILE,
                    ...JSON.parse(saved)
                });
            } catch (e) {
                console.error("Failed to parse profile", e);
            }
        }
    };
    const profileToDatabase = (profileData)=>{
        return {
            full_name: profileData.name,
            avatar_url: profileData.avatar_url,
            gender: profileData.gender,
            age: profileData.age ? parseInt(profileData.age) : null,
            location: profileData.location,
            height_cm: profileData.height ? parseInt(profileData.height) : null,
            weight_kg: profileData.weight ? parseInt(profileData.weight) : null,
            body_shape: profileData.bodyShape,
            fit_preference: profileData.fitPreference,
            skin_tone: profileData.skinTone,
            eye_color: profileData.eyeColor,
            hair_color: profileData.hairColor,
            lifestyle: profileData.lifestyle,
            archetypes: profileData.archetypes,
            brands: profileData.brands,
            price_range: profileData.priceRange,
            style_dna: profileData.styleDNA,
            style_report: profileData.styleReport
        };
    };
    const databaseToProfile = (dbProfile)=>{
        return {
            ...DEFAULT_PROFILE,
            name: dbProfile.full_name || "",
            avatar_url: dbProfile.avatar_url || "",
            gender: dbProfile.gender || "",
            age: dbProfile.age?.toString() || "",
            location: dbProfile.location || "",
            height: dbProfile.height_cm?.toString() || "",
            weight: dbProfile.weight_kg?.toString() || "",
            bodyShape: dbProfile.body_shape || "",
            fitPreference: dbProfile.fit_preference || "regular",
            skinTone: dbProfile.skin_tone || "",
            eyeColor: dbProfile.eye_color || "",
            hairColor: dbProfile.hair_color || "",
            lifestyle: dbProfile.lifestyle || DEFAULT_PROFILE.lifestyle,
            archetypes: dbProfile.archetypes || [],
            brands: dbProfile.brands || [],
            priceRange: dbProfile.price_range || "",
            styleDNA: dbProfile.style_dna || null,
            styleReport: dbProfile.style_report || null
        };
    };
    const getUser = async ()=>{
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"]) {
            return null;
        }
        try {
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["supabase"].auth.getUser();
            if (error) {
                console.error("Error fetching user:", error);
                return null;
            }
            return data.user;
        } catch (e) {
            console.error("Unexpected error fetching user:", e);
            return null;
        }
    };
    // Load from localStorage on mount and sync with Supabase
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const init = async ()=>{
            try {
                // Check if Supabase is configured before attempting to use it
                if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"]) {
                    // Fallback to localStorage when Supabase is not configured
                    loadProfileFromStorage();
                    setLoading(false);
                    return;
                }
                const { data: { user } } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["supabase"].auth.getUser();
                setUser(user);
                if (user) {
                    let loadedFromApi = false;
                    // Direct Supabase Fetch (Static Deployment Optimization)
                    const { data: dbProfile, error: dbError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["supabase"].from('profiles').select('*').eq('id', user.id).single();
                    if (dbError && dbError.code !== 'PGRST116') {
                        console.error("Error fetching profile from DB:", dbError);
                    } else if (dbProfile) {
                        const loadedProfile = databaseToProfile(dbProfile);
                        setProfile(loadedProfile);
                        localStorage.setItem('stylist_profile', JSON.stringify(loadedProfile));
                    } else {
                        // Profile doesn't exist in DB, fallback to localStorage
                        loadProfileFromStorage();
                    }
                } else {
                    // Not authenticated, use localStorage
                    loadProfileFromStorage();
                }
            } catch (err) {
                console.error("Error initializing profile:", err);
                setError(err.message);
                // Fallback to localStorage on error
                loadProfileFromStorage();
            } finally{
                setLoading(false);
            }
        };
        init();
    }, []);
    const saveProfile = async (newProfile)=>{
        // 1. Update local state
        const updated = {
            ...profile,
            ...newProfile
        };
        setProfile(updated);
        // 2. Sync to localStorage
        localStorage.setItem('stylist_profile', JSON.stringify(updated));
        // 3. Sync to API / Supabase (only if configured)
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"]) {
            return; // Only use localStorage when Supabase is not configured
        }
        const { data: { user } } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["supabase"].auth.getUser();
        if (!user) return; // Fallback to localStorage only
        // Direct Supabase Save (Static Deployment Optimization)
        const toSave = profileToDatabase(updated);
        const dataWithId = {
            ...toSave,
            id: user.id
        };
        try {
            const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["supabase"].from('profiles').upsert(dataWithId, {
                onConflict: 'id'
            });
            if (error) {
                console.error("Error saving profile to Supabase:", error);
                setError(error.message);
            } else {
                setError(null);
            }
        } catch (err) {
            console.error("Exception saving profile:", err);
            setError(err.message);
        }
    };
    const clearProfile = async ()=>{
        // Clear localStorage
        localStorage.removeItem('stylist_profile');
        // Reset local state
        setProfile(DEFAULT_PROFILE);
        // Optional: Clear from Supabase (only if configured)
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"]) {
            const { data: { user } } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["supabase"].auth.getUser();
            if (user) {
                try {
                    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["supabase"].from('profiles').delete().eq('id', user.id);
                } catch (err) {
                    // Silent fail
                    console.error("Error deleting profile from Supabase", err);
                }
            }
        }
    };
    return {
        profile,
        saveProfile,
        clearProfile,
        loading,
        user,
        error,
        getUser
    };
}
}),
"[project]/src/components/Navigation.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Navigation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shirt$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Shirt$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shirt.js [app-ssr] (ecmascript) <export default as Shirt>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PlusCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-plus.js [app-ssr] (ecmascript) <export default as PlusCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-ssr] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.js [app-ssr] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-ssr] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dna$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Dna$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/dna.js [app-ssr] (ecmascript) <export default as Dna>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useProfile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useProfile.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase-config.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
function Navigation() {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const { profile, loading, clearProfile } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useProfile$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useProfile"])();
    // Hide navigation on landing page, onboarding, and auth pages
    const isHidden = pathname === "/" || pathname?.startsWith("/onboarding") || pathname?.startsWith("/auth");
    if (isHidden) return null;
    const navItems = [
        {
            name: "Wardrobe",
            href: "/wardrobe",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shirt$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Shirt$3e$__["Shirt"]
        },
        {
            name: "Add Item",
            href: "/add-item",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PlusCircle$3e$__["PlusCircle"]
        },
        {
            name: "Style DNA",
            href: "/style-dna",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dna$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Dna$3e$__["Dna"]
        },
        {
            name: "Preferences",
            href: "/preferences",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"]
        }
    ];
    const handleSignOut = async ()=>{
        if (confirm("Are you sure you want to sign out?")) {
            if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"]) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["supabase"].auth.signOut();
            }
            clearProfile();
            router.push("/");
            router.refresh(); // Refresh to update middleware state
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: "hidden md:flex flex-col w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 h-screen fixed left-0 top-0 p-6 z-50",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 mb-10 px-2 text-primary",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                size: 24
                            }, void 0, false, {
                                fileName: "[project]/src/components/Navigation.tsx",
                                lineNumber: 43,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-serif text-xl font-bold tracking-tight",
                                children: "Gemini Stylist"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Navigation.tsx",
                                lineNumber: 44,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Navigation.tsx",
                        lineNumber: 42,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        className: "flex-1 space-y-2",
                        children: navItems.map((item)=>{
                            const isActive = pathname === item.href;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: item.href,
                                className: `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? "bg-primary text-black font-medium shadow-[0_0_15px_rgba(212,175,55,0.3)]" : "text-gray-400 hover:bg-white/5 hover:text-white"}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(item.icon, {
                                        size: 20,
                                        className: isActive ? "text-black" : "group-hover:text-primary transition-colors"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Navigation.tsx",
                                        lineNumber: 59,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: item.name
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Navigation.tsx",
                                        lineNumber: 60,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, item.href, true, {
                                fileName: "[project]/src/components/Navigation.tsx",
                                lineNumber: 51,
                                columnNumber: 29
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/components/Navigation.tsx",
                        lineNumber: 47,
                        columnNumber: 17
                    }, this),
                    !isHidden && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-4 p-4 bg-white/5 backdrop-blur border border-white/10 rounded-xl mx-2",
                        children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col items-center animate-pulse",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-12 h-12 bg-gray-700/50 rounded-full mb-3"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Navigation.tsx",
                                    lineNumber: 71,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-4 w-20 bg-gray-700/50 rounded"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Navigation.tsx",
                                    lineNumber: 72,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/Navigation.tsx",
                            lineNumber: 70,
                            columnNumber: 29
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: "/preferences",
                            className: "flex flex-col items-center group cursor-pointer hover:bg-white/5 transition-colors rounded-lg p-2 -m-2",
                            children: [
                                profile.avatar_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: profile.avatar_url,
                                    alt: profile.name || "User",
                                    className: "w-12 h-12 rounded-full border-2 border-primary/30 shadow-lg shadow-primary/10 object-cover mb-3"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Navigation.tsx",
                                    lineNumber: 77,
                                    columnNumber: 37
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30 shadow-lg shadow-primary/10 mb-3",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-primary font-bold text-xl",
                                        children: profile.name ? profile.name.split(" ").map((n)=>n[0]).join("").substring(0, 2).toUpperCase() : "U"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Navigation.tsx",
                                        lineNumber: 84,
                                        columnNumber: 41
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Navigation.tsx",
                                    lineNumber: 83,
                                    columnNumber: 37
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-gray-300 text-sm font-medium truncate max-w-[180px] group-hover:text-white transition-colors",
                                    children: profile.name || "User"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Navigation.tsx",
                                    lineNumber: 91,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/Navigation.tsx",
                            lineNumber: 75,
                            columnNumber: 29
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/Navigation.tsx",
                        lineNumber: 68,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "pt-6 border-t border-white/10",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleSignOut,
                            className: "flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white transition-colors w-full rounded-xl hover:bg-white/5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                    size: 20
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Navigation.tsx",
                                    lineNumber: 104,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "Sign Out"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Navigation.tsx",
                                    lineNumber: 105,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/Navigation.tsx",
                            lineNumber: 100,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/Navigation.tsx",
                        lineNumber: 99,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Navigation.tsx",
                lineNumber: 41,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "md:hidden fixed bottom-0 left-0 w-full bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/10 p-4 z-50 flex justify-around items-center pb-8 safe-area-pb",
                children: navItems.map((item)=>{
                    const isActive = pathname === item.href;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: item.href,
                        className: `flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${isActive ? "text-primary" : "text-gray-500 hover:text-white"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(item.icon, {
                                size: 24,
                                strokeWidth: isActive ? 2.5 : 2
                            }, void 0, false, {
                                fileName: "[project]/src/components/Navigation.tsx",
                                lineNumber: 121,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] font-medium",
                                children: item.name
                            }, void 0, false, {
                                fileName: "[project]/src/components/Navigation.tsx",
                                lineNumber: 122,
                                columnNumber: 29
                            }, this)
                        ]
                    }, item.href, true, {
                        fileName: "[project]/src/components/Navigation.tsx",
                        lineNumber: 115,
                        columnNumber: 25
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/components/Navigation.tsx",
                lineNumber: 111,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/src/components/ToastProvider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ToastProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
"use client";
;
;
function ToastProvider() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Toaster"], {
        position: "bottom-right",
        toastOptions: {
            style: {
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                color: "#1a1a1a"
            },
            className: "glass",
            duration: 4000
        }
    }, void 0, false, {
        fileName: "[project]/src/components/ToastProvider.tsx",
        lineNumber: 8,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/components/LayoutContent.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LayoutContent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Navigation$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Navigation.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ToastProvider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ToastProvider.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function LayoutContent({ children }) {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const isLanding = pathname === "/" || pathname?.startsWith("/onboarding") || pathname?.startsWith("/auth");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Navigation$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/components/LayoutContent.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: `min-h-screen transition-all duration-300 ${isLanding ? "" : "md:pl-64"}`,
                children: children
            }, void 0, false, {
                fileName: "[project]/src/components/LayoutContent.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ToastProvider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/components/LayoutContent.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6efc3683._.js.map