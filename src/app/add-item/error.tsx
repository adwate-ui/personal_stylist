"use client";

import { useEffect } from "react";
import { ErrorFallback } from "@/components/ErrorBoundary";

export default function AddItemError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Add Item page error:", error);
    }, [error]);

    return (
        <ErrorFallback
            message="We couldn't process your item. Please try uploading again or using a different image."
            onReset={reset}
        />
    );
}
