'use client'

import { useUIStore } from '@/lib/stores/uiStore'
import { Menu } from 'lucide-react'
import { GlobalSearch } from '@/components/shared/GlobalSearch'
import { NotificationDropdown } from '@/components/layout/NotificationDropdown'
import { usePathname } from 'next/navigation'

export function TopBar() {
  const { toggleSidebar } = useUIStore()
  const pathname = usePathname()

  if (pathname.startsWith('/dashboard/clients')) {
    return null
  }

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200/50 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 z-10 sticky top-0 transition-colors duration-300">
      <button
        type="button"
        className="md:hidden text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
        onClick={toggleSidebar}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex flex-1 justify-end items-center space-x-4">
        <div className="flex-1 max-w-sm mr-2 flex justify-end">
          <GlobalSearch />
        </div>

        <NotificationDropdown />
      </div>
    </header>
  )
}
