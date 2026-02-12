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
                <div className="flex flex-col items-center justify-center p-8 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-md min-h-100">
                    <div className="text-center max-w-md">
                        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Calendar failed to load</h2>
                        <p className="text-gray-600 mb-6">{error.message}</p>
                        <button
                            onClick={() => reset()}
                            className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/20 rounded-xl font-medium transition-all"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            }
        >
            {null}
        </ErrorBoundary>
    );
}