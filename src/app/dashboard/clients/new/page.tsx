'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useCreateClient } from '@/lib/hooks/useClients'
import { createClient } from '@/lib/supabase/client'

const clientSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  bride_name: z.string().optional(),
  groom_name: z.string().optional(),
  phone_primary: z.string().min(1, 'Primary phone is required'),
  phone_secondary: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  event_type: z.enum(['wedding', 'corporate', 'birthday', 'other']),
  budget_range: z.string().optional(),
})

type ClientFormValues = z.infer<typeof clientSchema>

export default function NewClientPage() {
  const router = useRouter()
  const { mutateAsync: createClientMutation, isPending } = useCreateClient()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setCurrentUserId(data.user.id)
      }
    })
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      event_type: 'wedding',
    },
  })

  const onSubmit = async (data: ClientFormValues) => {
    if (!currentUserId) return
    
    try {
      const newClient = await createClientMutation({
        ...data,
        client_code: `CL-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'lead',
        created_by: currentUserId,
      })
      router.push(`/dashboard/clients/${newClient.id}`)
    } catch (error) {
      console.error('Failed to create client:', error)
      alert('Failed to create client')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-5">
        <Link
          href="/dashboard/clients"
          className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h3 className="text-2xl font-semibold leading-6 text-gray-900 dark:text-white">
            New Client
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Create a new client record to start tracking their events and consultations.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div className="px-4 py-6 sm:p-8">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            
            <div className="sm:col-span-4">
              <label htmlFor="full_name" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                Full Name (or Company) *
              </label>
              <div className="mt-2">
                <input
                  {...register('full_name')}
                  type="text"
                  id="full_name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white dark:bg-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                />
                {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="bride_name" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                Bride Name (Optional)
              </label>
              <div className="mt-2">
                <input
                  {...register('bride_name')}
                  type="text"
                  id="bride_name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white dark:bg-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="groom_name" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                Groom Name (Optional)
              </label>
              <div className="mt-2">
                <input
                  {...register('groom_name')}
                  type="text"
                  id="groom_name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white dark:bg-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="phone_primary" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                Primary Phone *
              </label>
              <div className="mt-2">
                <input
                  {...register('phone_primary')}
                  type="tel"
                  id="phone_primary"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white dark:bg-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                />
                {errors.phone_primary && <p className="mt-1 text-sm text-red-600">{errors.phone_primary.message}</p>}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="phone_secondary" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                Secondary Phone
              </label>
              <div className="mt-2">
                <input
                  {...register('phone_secondary')}
                  type="tel"
                  id="phone_secondary"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white dark:bg-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                Email Address
              </label>
              <div className="mt-2">
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white dark:bg-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="event_type" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                Event Type *
              </label>
              <div className="mt-2">
                <select
                  {...register('event_type')}
                  id="event_type"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white dark:bg-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                >
                  <option value="wedding">Wedding</option>
                  <option value="corporate">Corporate</option>
                  <option value="birthday">Birthday</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="budget_range" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                Budget Range
              </label>
              <div className="mt-2">
                <input
                  {...register('budget_range')}
                  type="text"
                  id="budget_range"
                  placeholder="e.g. 5L - 10L BDT"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white dark:bg-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                />
              </div>
            </div>

          </div>
        </div>
        <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 dark:border-gray-700 px-4 py-4 sm:px-8 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
          <Link
            href="/dashboard/clients"
            className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-300 hover:text-indigo-600"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending || !currentUserId}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Saving...' : 'Save Client'}
          </button>
        </div>
      </form>
    </div>
  )
}
