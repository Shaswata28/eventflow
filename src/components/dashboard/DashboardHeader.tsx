'use client'

import { useEffect, useState } from 'react'

export function DashboardHeader({ userName }: { userName?: string }) {
  const [greeting, setGreeting] = useState('Hello')
  const [dateString, setDateString] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Set greeting based on local time
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    // Set local date string
    setDateString(new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    }))
  }, [])

  const firstName = userName ? userName.split(' ')[0] : ''

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-200 dark:border-gray-800 pb-6 pt-2 animate-in fade-in slide-in-from-top-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {mounted ? (
            <>{greeting}{firstName ? `, ${firstName}` : ''}</>
          ) : (
            <>Hello{firstName ? `, ${firstName}` : ''}</>
          )}
        </h1>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          Here's what's happening across your event portfolio today.
        </p>
      </div>
      <div className="text-right hidden sm:block">
        <p className="text-sm font-medium text-gray-900 dark:text-white h-5">
          {mounted ? dateString : ''}
        </p>
      </div>
    </div>
  )
}
