"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

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
    archetypes: [] as string[],
    brands: [] as string[],
    priceRange: "",
    styleReport: null as any,
    styleDNA: null as any,
    gemini_api_key: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
    image_extractor_api_key: ""
};

type ProfileType = typeof DEFAULT_PROFILE;

interface ProfileContextType {
    profile: ProfileType;
    user: User | null;
    loading: boolean;
    error: string | null;
    saveProfile: (updates: Partial<ProfileType>) => Promise<void>;
    clearProfile: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const [profile, setProfile] = useState<ProfileType>(DEFAULT_PROFILE);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProfileFromStorage = () => {
        const saved = localStorage.getItem('stylist_profile');
        if (saved) {
            try {
                setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(saved) });
            } catch (e) {
                console.error("Failed to parse profile", e);
            }
        }
    };

    const databaseToProfile = (dbProfile: any) => {
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
            styleReport: dbProfile.style_report || null,
            gemini_api_key: dbProfile.gemini_api_key || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
            image_extractor_api_key: dbProfile.image_extractor_api_key || ""
        };
    };

    const profileToDatabase = (profileData: ProfileType) => {
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
            style_report: profileData.styleReport,
            gemini_api_key: profileData.gemini_api_key,
            image_extractor_api_key: profileData.image_extractor_api_key
        };
    };

    const fetchProfile = async () => {
        try {
            if (!isSupabaseConfigured) {
                loadProfileFromStorage();
                setLoading(false);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data: dbProfile, error: dbError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (dbError && dbError.code !== 'PGRST116') {
                    console.error("Error fetching profile from DB:", dbError);
                } else if (dbProfile) {
                    const loadedProfile = databaseToProfile(dbProfile);
                    setProfile(loadedProfile);
                    localStorage.setItem('stylist_profile', JSON.stringify(loadedProfile));
                } else {
                    loadProfileFromStorage();
                }
            } else {
                loadProfileFromStorage();
            }
        } catch (err: any) {
            console.error("Error initializing profile:", err);
            setError(err.message);
            loadProfileFromStorage();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const saveProfile = async (newProfile: Partial<ProfileType>) => {
        // 1. Update local state
        const updated = { ...profile, ...newProfile };
        setProfile(updated);

        // 2. Sync to localStorage
        localStorage.setItem('stylist_profile', JSON.stringify(updated));

        // 3. Sync to API / Supabase (only if configured)
        if (!isSupabaseConfigured) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const toSave = profileToDatabase(updated);
        const dataWithId = { ...toSave, id: user.id };

        try {
            const { error } = await supabase
                .from('profiles')
                .upsert(dataWithId, { onConflict: 'id' });

            if (error) {
                console.warn("Full profile save failed, retrying with legacy fields...", error);
                const { image_extractor_api_key: _image_extractor_api_key, ...legacyData } = dataWithId;
                const { error: retryError } = await supabase
                    .from('profiles')
                    .upsert(legacyData, { onConflict: 'id' });

                if (retryError) {
                    console.error("Retry save failed:", retryError);
                    setError(retryError.message);
                } else {
                    setError(null);
                }
            } else {
                setError(null);
            }
        } catch (err: any) {
            console.error("Exception saving profile:", err);
            setError(err.message);
        }
    };

    const clearProfile = async () => {
        localStorage.removeItem('stylist_profile');
        setProfile(DEFAULT_PROFILE);
        if (isSupabaseConfigured) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('profiles').delete().eq('id', user.id);
            }
        }
    };

    return (
        <ProfileContext.Provider value={{
            profile,
            user,
            loading,
            error,
            saveProfile,
            clearProfile,
            refreshProfile: fetchProfile
        }}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error("useProfile must be used within a ProfileProvider");
    }
    return context;
}
