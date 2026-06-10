'use client'

import { EventCalendar } from '@/components/calendar/EventCalendar'
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents'
import Link from 'next/link'

export default function CalendarPage() {
  return (
    <div className="flex flex-col lg:flex-row -mt-6 -mb-6 -mx-4 sm:-mx-6 lg:-mx-8 min-h-[calc(100vh-4rem)]">
      {/* Main Calendar Area */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationFillMode: 'both', animationDelay: '100ms' }}>
        <EventCalendar />
      </div>

      {/* Right Sidebar */}
      <aside className="w-full lg:w-80 lg:max-w-xs border-t lg:border-t-0 lg:border-l border-gray-200/50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30 backdrop-blur-md p-4 lg:p-4 flex flex-col gap-4 flex-shrink-0">
        <div className="space-y-4 flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationFillMode: 'both', animationDelay: '200ms' }}>
          <UpcomingEvents hideViewCalendar={true} className="flex-1" />
        </div>
        <div className="pt-2 animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationFillMode: 'both', animationDelay: '300ms' }}>
          <Link 
            href="/dashboard/clients" 
            className="block w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-bold shadow-sm hover:scale-105 active:scale-95 transition-all"
          >
            Create New Event
          </Link>
        </div>
      </aside>
    </div>
  )
}
