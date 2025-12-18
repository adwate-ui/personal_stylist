export const ERROR_CODES = {
    CONFIG_ERROR: "CONFIG_ERROR",
    UNAUTHORIZED: "UNAUTHORIZED",
    STORAGE_ERROR: "STORAGE_ERROR",
    GEMINI_ERROR: "GEMINI_ERROR",
    AI_FAILURE: "AI_FAILURE",
    VALIDATION_ERROR: "VALIDATION_ERROR",
    DATABASE_ERROR: "DATABASE_ERROR",
    UNKNOWN_ERROR: "UNKNOWN_ERROR"
} as const;

type ErrorCode = keyof typeof ERROR_CODES;

export const FRIENDLY_MESSAGES: Record<ErrorCode, string> = {
    CONFIG_ERROR: "Service configuration issue. Please contact support.",
    UNAUTHORIZED: "Please log in to continue.",
    STORAGE_ERROR: "Failed to upload image. Please check your connection.",
    GEMINI_ERROR: "AI analysis server is temporarily unavailable. Please try again.",
    AI_FAILURE: "Unable to analyze image. Try a clearer photo.",
    VALIDATION_ERROR: "Please check your input and try again.",
    DATABASE_ERROR: "We encountered an issue saving your data. Please try again.",
    UNKNOWN_ERROR: "Something went wrong. Please try again."
};

export function getFriendlyMessage(code: string): string {
    return FRIENDLY_MESSAGES[code as ErrorCode] || FRIENDLY_MESSAGES.UNKNOWN_ERROR;
}

export function createErrorResponse(code: ErrorCode, details?: string, status: number = 500) {
    return Response.json(
        {
            error: code,
            message: FRIENDLY_MESSAGES[code],
            details: details
        },
        { status }
    );
}
