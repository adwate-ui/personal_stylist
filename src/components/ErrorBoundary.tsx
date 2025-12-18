"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorFallbackProps {
    message?: string;
    onReset?: () => void;
}

export function ErrorFallback({ message, onReset }: ErrorFallbackProps) {
    return (
        <div className="w-full min-h-[400px] flex flex-col items-center justify-center p-6 text-center">
            <div className="glass p-8 rounded-2xl max-w-md w-full border border-red-200/20 shadow-xl backdrop-blur-md">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>

                <h2 className="text-2xl font-serif font-semibold text-gray-800 mb-2">
                    Something went wrong
                </h2>

                <p className="text-gray-600 mb-6">
                    {message || "An unexpected error occurred. Please try again."}
                </p>

                <div className="flex gap-4 justify-center">
                    {onReset && (
                        <button
                            onClick={onReset}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </button>
                    )}

                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                    >
                        <Home className="w-4 h-4" />
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
    message?: string;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public reset = () => {
        this.setState({ hasError: false, error: undefined });
        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <ErrorFallback
                    message={this.props.message || this.state.error?.message}
                    onReset={this.reset}
                />
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
