import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateProgram, usePrograms } from '@/lib/hooks/usePrograms'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const programSchema = z.object({
  program_name: z.enum(['holud', 'mehendi', 'reception', 'engagement', 'corporate', 'birthday', 'custom']),
  custom_name: z.string().optional(),
  event_date: z.string().min(1, 'Date is required'),
  venue_name: z.string().optional(),
  guest_count: z.string().optional(),
  theme_notes: z.string().optional()
})

type ProgramFormValues = z.infer<typeof programSchema>

export function NewProgramSheet({ 
  clientId, 
  isOpen, 
  onClose 
}: { 
  clientId: string, 
  isOpen: boolean, 
  onClose: () => void 
}) {
  const { mutateAsync: createProgram, isPending } = useCreateProgram()
  const { data: allPrograms } = usePrograms() // fetch all to check conflicts
  const [conflictWarning, setConflictWarning] = useState<string | null>(null)
  
  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      program_name: 'reception',
      custom_name: '',
      event_date: '',
      venue_name: '',
      theme_notes: ''
    }
  })

  const selectedDate = form.watch('event_date')
  const selectedType = form.watch('program_name')

  useEffect(() => {
    if (selectedDate && allPrograms) {
      const conflicts = allPrograms.filter((p: any) => p.event_date === selectedDate)
      if (conflicts.length > 0) {
        setConflictWarning(`Warning: There are ${conflicts.length} other program(s) scheduled on this date!`)
      } else {
        setConflictWarning(null)
      }
    } else {
      setConflictWarning(null)
    }
  }, [selectedDate, allPrograms])

  const onSubmit = async (data: ProgramFormValues) => {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    
    if (!userData.user) return

    await createProgram({
      client_id: clientId,
      program_name: data.program_name,
      custom_name: data.program_name === 'custom' ? data.custom_name : null,
      event_date: data.event_date,
      venue_name: data.venue_name || null,
      guest_count: data.guest_count ? parseInt(data.guest_count) : null,
      theme_notes: data.theme_notes || null,
      status: 'planning',
      created_by: userData.user.id,
      responsible_partner: userData.user.id
    })

    form.reset()
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add New Program</SheetTitle>
          <SheetDescription>
            Schedule a new event program for this client.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="program_name">Program Type</Label>
            <Select 
              onValueChange={(val) => form.setValue('program_name', val as any)} 
              defaultValue={form.getValues('program_name')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="holud">Holud</SelectItem>
                <SelectItem value="mehendi">Mehendi</SelectItem>
                <SelectItem value="reception">Reception</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
                <SelectItem value="birthday">Birthday</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedType === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="custom_name">Custom Name</Label>
              <Input id="custom_name" {...form.register('custom_name')} placeholder="e.g. Sangeet" />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="event_date">Event Date</Label>
            <Input id="event_date" type="date" {...form.register('event_date')} />
            {form.formState.errors.event_date && (
              <p className="text-sm text-red-500">{form.formState.errors.event_date.message}</p>
            )}
            
            {conflictWarning && (
              <Alert variant="destructive" className="mt-2 bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-900 dark:text-amber-300">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Schedule Conflict</AlertTitle>
                <AlertDescription>{conflictWarning}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue_name">Venue Name</Label>
            <Input id="venue_name" {...form.register('venue_name')} placeholder="e.g. Senamalancha" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guest_count">Estimated Guest Count</Label>
            <Input id="guest_count" type="number" {...form.register('guest_count')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme_notes">Theme / Notes</Label>
            <Textarea id="theme_notes" {...form.register('theme_notes')} placeholder="e.g. Floral theme, pastel colors" />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Saving...' : 'Create Program'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
