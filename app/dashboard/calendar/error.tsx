// app/dashboard/calendar/error.tsx
"use client";

import ErrorBoundary from "@/components/error-boundary";

export default function CalendarError({
    error,
    reset,
}: {
    error: Error;
    reset: () => void;
}) {
    return (
        <ErrorBoundary
            fallback={
                <div className="p-8 text-center">
                    <h2 className="text-xl font-bold mb-2">Calendar failed to load</h2>
                    <p className="text-gray-600 mb-4">{error.message}</p>
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Try again
                    </button>
                </div>
            }
        >
            {null}
        </ErrorBoundary>
    );
}
