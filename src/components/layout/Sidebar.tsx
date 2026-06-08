'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings,
  X,
  Store,
  CheckSquare
} from 'lucide-react'
import { useUIStore } from '@/lib/stores/uiStore'
import { usePendingApprovals } from '@/lib/hooks/useApprovals'
import { Badge } from '@/components/ui/badge'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
  { name: 'Clients', href: '/dashboard/clients', icon: Users },
  { name: 'Vendors', href: '/dashboard/vendors', icon: Store },
  { name: 'Approvals', href: '/dashboard/approvals', icon: CheckSquare },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  
  // Fetch pending approvals for badge (polls silently due to hook setup)
  const { data: pendingApprovals } = usePendingApprovals()
  const pendingCount = pendingApprovals?.length || 0

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar component */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] 
        transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-semibold text-white tracking-tight">EventFlow</span>
          </Link>
          <button 
            className="md:hidden text-[#94a3b8] hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md
                  ${isActive 
                    ? 'bg-[#1e293b] text-white' 
                    : 'text-[#94a3b8] hover:bg-[#1e293b]/50 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center">
                  <Icon 
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'
                    }`} 
                  />
                  {item.name}
                </div>
                {item.name === 'Approvals' && pendingCount > 0 && (
                  <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center rounded-full ml-2">
                    {pendingCount}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
