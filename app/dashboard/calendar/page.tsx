// app/dashboard/calendar/page.tsx
export default function CalendarPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
                <p className="text-gray-600">Schedule and manage appointments</p>
            </div>

            <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">Coming Soon</h2>
                <p className="text-gray-600">
                    Calendar integration will be available in the next update. You&apos;ll be able to:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                    <li>Schedule appointments with leads</li>
                    <li>Sync with Google Calendar</li>
                    <li>Set availability hours</li>
                    <li>Send automatic reminders</li>
                    <li>Track appointment history</li>
                </ul>
            </div>
        </div>
    );
}