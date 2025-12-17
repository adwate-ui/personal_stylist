"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { ProfileData } from '@/types/profile';

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
    styleDNA: null as any
};

export function useProfile() {
    const [profile, setProfile] = useState(DEFAULT_PROFILE);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    const profileToDatabase = (profileData: typeof DEFAULT_PROFILE) => {
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
            style_dna: profileData.styleDNA
        };
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
            styleDNA: dbProfile.style_dna || null
        };
    };

    const getUser = async () => {
        try {
            const { data, error } = await supabase.auth.getUser();
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
    useEffect(() => {
        const init = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);

                if (user) {
                    let loadedFromApi = false;

                    // Attempt 1: Fetch from API
                    try {
                        const res = await fetch('/api/profile');
                        if (res.ok) {
                            const dbProfile = await res.json();
                            // Check if profile exists (not empty)
                            if (dbProfile && (dbProfile.id || Object.keys(dbProfile).length > 0)) {
                                const loadedProfile = databaseToProfile(dbProfile);
                                setProfile(loadedProfile);
                                localStorage.setItem('stylist_profile', JSON.stringify(loadedProfile));
                                loadedFromApi = true;
                            }
                        }
                    } catch (apiErr) {
                        console.warn("Profile API fetch failed, falling back to direct DB:", apiErr);
                    }

                    // Attempt 2: Fallback to Direct Supabase if API didn't yield results
                    if (!loadedFromApi) {
                        const { data: dbProfile, error: dbError } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', user.id)
                            .single();

                        if (dbError && dbError.code !== 'PGRST116') { // PGRST116 is 'Row not found'
                            console.error("Error fetching profile from DB:", dbError);
                            // Not throwing here to allow fallback to localStorage
                        } else if (dbProfile) {
                            const loadedProfile = databaseToProfile(dbProfile);
                            setProfile(loadedProfile);
                            localStorage.setItem('stylist_profile', JSON.stringify(loadedProfile));
                        } else {
                            // Profile doesn't exist in DB, fallback to localStorage
                            const saved = localStorage.getItem('stylist_profile');
                            if (saved) {
                                try {
                                    setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(saved) });
                                } catch (e) {
                                    console.error("Failed to parse profile", e);
                                }
                            } else {
                                setProfile(DEFAULT_PROFILE);
                            }
                        }
                    }
                } else {
                    // Not authenticated, use localStorage
                    const saved = localStorage.getItem('stylist_profile');
                    if (saved) {
                        try {
                            setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(saved) });
                        } catch (e) {
                            console.error("Failed to parse profile", e);
                        }
                    }
                }
            } catch (err: any) {
                console.error("Error initializing profile:", err);
                setError(err.message);
                // Fallback to localStorage on error
                const saved = localStorage.getItem('stylist_profile');
                if (saved) {
                    try {
                        setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(saved) });
                    } catch (e) {
                        console.error("Failed to parse profile", e);
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    const saveProfile = async (newProfile: Partial<typeof DEFAULT_PROFILE>) => {
        // 1. Update local state
        const updated = { ...profile, ...newProfile };
        setProfile(updated);

        // 2. Sync to localStorage
        localStorage.setItem('stylist_profile', JSON.stringify(updated));

        // 3. Sync to API / Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return; // Fallback to localStorage only

        // Attempt 1: POST to API
        try {
            const res = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });

            if (!res.ok) {
                throw new Error("API Save failed");
            }
            setError(null);
            return; // Success
        } catch (apiErr) {
            console.warn("Profile API save failed, falling back to direct DB:", apiErr);
        }

        // Attempt 2: Fallback to Direct Supabase
        const toSave = profileToDatabase(updated);

        // Add ID to data object
        const dataWithId = { ...toSave, id: user.id };

        try {
            const { error } = await supabase
                .from('profiles')
                .upsert(dataWithId, { onConflict: 'id' });

            if (error) {
                console.error("Error saving profile to Supabase:", error);
                setError(error.message);
            } else {
                setError(null);
            }
        } catch (err: any) {
            console.error("Exception saving profile:", err);
            setError(err.message);
        }
    };

    const clearProfile = async () => {
        // Clear localStorage
        localStorage.removeItem('stylist_profile');

        // Reset local state
        setProfile(DEFAULT_PROFILE);

        // Optional: Clear from Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            try {
                await supabase.from('profiles').delete().eq('id', user.id);
            } catch (err) {
                // Silent fail
                console.error("Error deleting profile from Supabase", err);
            }
        }
    };

    return { profile, saveProfile, clearProfile, loading, user, error, getUser };
}
