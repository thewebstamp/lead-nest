// app/dashboard/settings/page.tsx
export default function SettingsPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">Manage your business settings and preferences</p>
            </div>

            <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">Coming Soon</h2>
                <p className="text-gray-600">
                    Settings page will be available in the next update. You&apos;ll be able to:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                    <li>Update business information</li>
                    <li>Manage services offered</li>
                    <li>Configure email notifications</li>
                    <li>Set up team members</li>
                    <li>Customize lead form fields</li>
                </ul>
            </div>
        </div>
    );
}