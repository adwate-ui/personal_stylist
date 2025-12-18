"use client";

import { useEffect } from "react";
import { ErrorFallback } from "@/components/ErrorBoundary";

export default function ShopError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Shop page error:", error);
    }, [error]);

    return (
        <ErrorFallback
            message="We couldn't analyze this item. It might be due to a temporary service issue."
            onReset={reset}
        />
    );
}
