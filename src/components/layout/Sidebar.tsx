'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings,
  X,
  Store,
  CheckSquare,
  LogOut,
  User as UserIcon
} from 'lucide-react'
import { useUIStore } from '@/lib/stores/uiStore'
import { usePendingApprovals } from '@/lib/hooks/useApprovals'
import { useProfile } from '@/lib/hooks/useProfile'
import { Badge } from '@/components/ui/badge'
import { createBrowserClient } from '@supabase/ssr'
import { useQueryClient } from '@tanstack/react-query'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
  { name: 'Clients', href: '/dashboard/clients', icon: Users },
  { name: 'Vendors', href: '/dashboard/vendors', icon: Store },
  { name: 'Approvals', href: '/dashboard/approvals', icon: CheckSquare },
]

const bottomNavigation = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const queryClient = useQueryClient()
  
  // Fetch pending approvals for badge (polls silently due to hook setup)
  const { data: pendingApprovals } = usePendingApprovals()
  const pendingCount = pendingApprovals?.length || 0

  const { data: profile } = useProfile()

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    queryClient.clear()
    router.push('/login')
  }

  const renderNavItems = (items: typeof navigation) => (
    items.map((item) => {
      const isActive = pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')
      const Icon = item.icon
      return (
        <Link
          key={item.name}
          href={item.href}
          className={`
            group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-all duration-150
            ${isActive 
              ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            }
          `}
        >
          <div className="flex items-center">
            <Icon 
              className={`mr-3 h-[20px] w-[20px] flex-shrink-0 ${
                isActive ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground group-hover:text-sidebar-accent-foreground'
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
    })
  )

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
        fixed inset-y-0 left-0 z-50 w-[240px] bg-sidebar flex flex-col
        transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-16 items-center justify-between px-6 pt-6 mb-10">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white tracking-tight">EventFlow</span>
          </Link>
          <button 
            className="md:hidden text-sidebar-foreground hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {renderNavItems(navigation)}
        </nav>

        <div className="mt-auto px-3 space-y-1 border-t border-sidebar-border pt-6 pb-4">
          {renderNavItems(bottomNavigation)}
          <button
            onClick={handleLogout}
            className="w-full group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-all duration-150 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <div className="flex items-center">
              <LogOut className="mr-3 h-[20px] w-[20px] flex-shrink-0 text-sidebar-foreground group-hover:text-sidebar-accent-foreground" />
              Log Out
            </div>
          </button>
          
          <div className="mt-4 pt-4 border-t border-sidebar-border px-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sidebar-accent overflow-hidden border border-sidebar-border flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-sidebar-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white leading-tight">
                  {profile?.name || 'Loading...'}
                </span>
                <span className="text-xs text-sidebar-foreground capitalize">
                  {profile?.role ? profile.role.replace('_', ' ') : 'User'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
