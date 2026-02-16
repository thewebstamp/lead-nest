// app/(auth)/reset-password/loading.tsx
export default function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                <p className="mt-4 text-sm text-gray-300">Loading...</p>
            </div>
        </div>
    );
}