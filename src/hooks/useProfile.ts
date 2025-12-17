"use client";

import { useState, useEffect } from 'react';

// Default empty profile
const DEFAULT_PROFILE = {
    name: "",
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

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('stylist_profile');
        if (saved) {
            try {
                setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(saved) });
            } catch (e) {
                console.error("Failed to parse profile", e);
            }
        }
        setLoading(false);
    }, []);

    const saveProfile = (newProfile: Partial<typeof DEFAULT_PROFILE>) => {
        const updated = { ...profile, ...newProfile };
        setProfile(updated);
        localStorage.setItem('stylist_profile', JSON.stringify(updated));
    };

    const clearProfile = () => {
        setProfile(DEFAULT_PROFILE);
        localStorage.removeItem('stylist_profile');
    };

    return { profile, saveProfile, clearProfile, loading };
}
