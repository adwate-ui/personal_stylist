"use client";

import { useEffect } from "react";
import { ErrorFallback } from "@/components/ErrorBoundary";

export default function WardrobeError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Wardrobe page error:", error);
    }, [error]);

    return (
        <ErrorFallback
            message="We couldn't load your wardrobe. Please check your connection and try again."
            onReset={reset}
        />
    );
}
