import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUpdateClient } from '@/lib/hooks/useClients'
import { Database } from '@/types/database.types'

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
type ClientRow = Database['public']['Tables']['clients']['Row']

export function EditClientSheet({ 
  client,
  isOpen, 
  onClose 
}: { 
  client: ClientRow, 
  isOpen: boolean, 
  onClose: () => void 
}) {
  const { mutateAsync: updateClient, isPending } = useUpdateClient()
  
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      full_name: client.full_name || '',
      bride_name: client.bride_name || '',
      groom_name: client.groom_name || '',
      phone_primary: client.phone_primary || '',
      phone_secondary: client.phone_secondary || '',
      email: client.email || '',
      event_type: client.event_type as any || 'wedding',
      budget_range: client.budget_range || '',
    }
  })

  // Reset form when client changes
  useEffect(() => {
    if (client) {
      form.reset({
        full_name: client.full_name || '',
        bride_name: client.bride_name || '',
        groom_name: client.groom_name || '',
        phone_primary: client.phone_primary || '',
        phone_secondary: client.phone_secondary || '',
        email: client.email || '',
        event_type: client.event_type as any || 'wedding',
        budget_range: client.budget_range || '',
      })
    }
  }, [client, form])

  const onSubmit = async (data: ClientFormValues) => {
    try {
      await updateClient({
        id: client.id,
        ...data,
      })
      onClose()
    } catch (error) {
      console.error('Failed to update client:', error)
      alert('Failed to update client')
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Client</SheetTitle>
          <SheetDescription>
            Update client details.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name (or Company) *</Label>
            <Input id="full_name" {...form.register('full_name')} />
            {form.formState.errors.full_name && <p className="text-sm text-red-500">{form.formState.errors.full_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bride_name">Bride Name</Label>
            <Input id="bride_name" {...form.register('bride_name')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="groom_name">Groom Name</Label>
            <Input id="groom_name" {...form.register('groom_name')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_primary">Primary Phone *</Label>
            <Input id="phone_primary" type="tel" {...form.register('phone_primary')} />
            {form.formState.errors.phone_primary && <p className="text-sm text-red-500">{form.formState.errors.phone_primary.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_secondary">Secondary Phone</Label>
            <Input id="phone_secondary" type="tel" {...form.register('phone_secondary')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register('email')} />
            {form.formState.errors.email && <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="event_type">Event Type</Label>
            <Select 
              onValueChange={(val) => form.setValue('event_type', val as any)} 
              defaultValue={form.getValues('event_type')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wedding">Wedding</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
                <SelectItem value="birthday">Birthday</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget_range">Budget Range</Label>
            <Input id="budget_range" {...form.register('budget_range')} placeholder="e.g. 5L - 10L BDT" />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
