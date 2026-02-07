// app/dashboard/analytics/page.tsx
export default function AnalyticsPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600">View detailed analytics and insights</p>
            </div>

            <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">Coming Soon</h2>
                <p className="text-gray-600">
                    Advanced analytics features will be available soon. You&apos;ll be able to track:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                    <li>Lead conversion trends</li>
                    <li>Response time analytics</li>
                    <li>Service performance</li>
                    <li>Revenue projections</li>
                    <li>Customer acquisition costs</li>
                </ul>
            </div>
        </div>
    );
}