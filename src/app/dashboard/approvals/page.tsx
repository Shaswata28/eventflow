import { redirect } from 'next/navigation'
import { ApprovalList } from '@/components/approvals/ApprovalList'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Approvals - EventFlow',
}

export default async function ApprovalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profile as any)?.role

  // Role Guard: Only finance_manager and managing_director can access
  if (role !== 'finance_manager' && role !== 'managing_director') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-500 max-w-md">
            You do not have permission to view the Approvals dashboard. 
            Only the Finance Manager and Managing Director can approve vendor assignments.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vendor Approvals</h1>
        <p className="text-sm text-gray-500 mt-1">Review and manage pending vendor assignment requests.</p>
      </div>

      <ApprovalList />
    </div>
  )
}
