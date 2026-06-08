'use client'

import { EventCalendar } from '@/components/calendar/EventCalendar'

export default function CalendarPage() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
          Global Event Calendar
        </h2>
      </div>

      <EventCalendar />
    </div>
  )
}
