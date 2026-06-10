import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUpdateProgram } from '@/lib/hooks/usePrograms'

const programSchema = z.object({
  program_name: z.enum(['holud', 'mehendi', 'reception', 'engagement', 'corporate', 'birthday', 'custom']),
  custom_name: z.string().optional(),
  event_date: z.string().min(1, 'Date is required'),
  venue_name: z.string().optional(),
  guest_count: z.string().optional(),
  theme_notes: z.string().optional(),
  color: z.string().optional()
})

type ProgramFormValues = z.infer<typeof programSchema>

export function EditProgramSheet({ 
  program, 
  isOpen, 
  onClose 
}: { 
  program: any, 
  isOpen: boolean, 
  onClose: () => void 
}) {
  const { mutateAsync: updateProgram, isPending } = useUpdateProgram()
  
  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      program_name: program?.program_name || 'reception',
      custom_name: program?.custom_name || '',
      event_date: program?.event_date ? new Date(program.event_date).toISOString().split('T')[0] : '',
      venue_name: program?.venue_name || '',
      theme_notes: program?.theme_notes || '',
      guest_count: program?.guest_count ? String(program.guest_count) : '',
      color: program?.color || '#E3B505'
    }
  })

  useEffect(() => {
    if (program) {
      form.reset({
        program_name: program.program_name || 'reception',
        custom_name: program.custom_name || '',
        event_date: program.event_date ? new Date(program.event_date).toISOString().split('T')[0] : '',
        venue_name: program.venue_name || '',
        theme_notes: program.theme_notes || '',
        guest_count: program.guest_count ? String(program.guest_count) : '',
        color: program.color || '#E3B505'
      })
    }
  }, [program, form])

  const selectedType = form.watch('program_name')

  const onSubmit = async (data: ProgramFormValues) => {
    try {
      await updateProgram({
        id: program.id,
        program_name: data.program_name as any,
        custom_name: data.program_name === 'custom' ? data.custom_name : null,
        event_date: data.event_date,
        venue_name: data.venue_name || null,
        guest_count: data.guest_count ? parseInt(data.guest_count) : null,
        theme_notes: data.theme_notes || null,
        color: data.color || '#E3B505'
      })

      onClose()
    } catch (error) {
      console.error('Failed to update program:', error)
      alert('Failed to update program')
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Program Details</SheetTitle>
          <SheetDescription>
            Update the details for this event program.
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

          <div className="space-y-2">
            <Label htmlFor="color">Event Color</Label>
            <Select 
              onValueChange={(val) => form.setValue('color', val ?? undefined)} 
              defaultValue={form.getValues('color')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="#E3B505">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#E3B505]" /> Mustard Yellow</div>
                </SelectItem>
                <SelectItem value="#5C4033">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#5C4033]" /> Dark Brown</div>
                </SelectItem>
                <SelectItem value="#DCAE96">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#DCAE96]" /> Dusty Rose</div>
                </SelectItem>
                <SelectItem value="#800020">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#800020]" /> Burgundy</div>
                </SelectItem>
                <SelectItem value="#4169E1">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#4169E1]" /> Royal Blue</div>
                </SelectItem>
                <SelectItem value="#87CEEB">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#87CEEB]" /> Sky Blue</div>
                </SelectItem>
                <SelectItem value="#191970">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#191970]" /> Midnight Blue</div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
