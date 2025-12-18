"use client";

import { Toaster } from "sonner";


export default function ToastProvider() {
    return (
        <Toaster
            position="bottom-right"
            toastOptions={{
                style: {
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(212, 175, 55, 0.3)",
                    color: "#1a1a1a",
                },
                className: "glass",
                duration: 4000,
            }}
        />
    );
}
