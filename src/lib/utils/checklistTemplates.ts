import { Database } from '@/types/database.types'

type TaskPriority = Database['public']['Enums']['task_priority']
type ProgramNameType = Database['public']['Enums']['program_name_type']

export interface ChecklistTemplateItem {
  department: string
  task_title: string
  priority: TaskPriority
}

export const GENERIC_TEMPLATES: Record<ProgramNameType | 'default', ChecklistTemplateItem[]> = {
  default: [
    { department: 'Venue', task_title: 'Confirm venue access time', priority: 'high' },
    { department: 'Venue', task_title: 'Check AC and lighting', priority: 'normal' },
    { department: 'Decor', task_title: 'Setup stage', priority: 'high' },
    { department: 'Decor', task_title: 'Setup entrance and walkways', priority: 'normal' },
    { department: 'Catering', task_title: 'Confirm food arrival time', priority: 'high' },
    { department: 'Catering', task_title: 'Setup dining area', priority: 'normal' },
    { department: 'Logistics', task_title: 'Test sound system', priority: 'high' },
    { department: 'Logistics', task_title: 'Check backup generator', priority: 'high' },
  ],
  reception: [
    { department: 'Venue', task_title: 'Confirm stage location', priority: 'high' },
    { department: 'Decor', task_title: 'Setup wedding stage', priority: 'high' },
    { department: 'Decor', task_title: 'Floral arrangements', priority: 'normal' },
    { department: 'Catering', task_title: 'Setup buffet line', priority: 'high' },
    { department: 'Catering', task_title: 'VIP seating arrangement', priority: 'normal' },
    { department: 'Photography', task_title: 'Photographer arrival and setup', priority: 'high' },
  ],
  holud: [
    { department: 'Decor', task_title: 'Setup holud stage', priority: 'high' },
    { department: 'Decor', task_title: 'Arrange holud props', priority: 'normal' },
    { department: 'Catering', task_title: 'Setup food stalls', priority: 'normal' },
    { department: 'Logistics', task_title: 'Sound check for performances', priority: 'high' },
  ],
  mehendi: [
    { department: 'Decor', task_title: 'Floor seating setup', priority: 'high' },
    { department: 'Decor', task_title: 'Lighting setup', priority: 'normal' },
    { department: 'Logistics', task_title: 'Background music setup', priority: 'normal' },
  ],
  engagement: [
    { department: 'Decor', task_title: 'Stage setup', priority: 'high' },
    { department: 'Catering', task_title: 'Snacks and dining setup', priority: 'high' },
  ],
  corporate: [
    { department: 'Venue', task_title: 'Seating arrangement', priority: 'high' },
    { department: 'Logistics', task_title: 'Projector and screen setup', priority: 'high' },
    { department: 'Logistics', task_title: 'Microphone test', priority: 'high' },
    { department: 'Catering', task_title: 'Refreshments setup', priority: 'normal' },
  ],
  birthday: [
    { department: 'Decor', task_title: 'Theme decoration setup', priority: 'high' },
    { department: 'Catering', task_title: 'Cake table setup', priority: 'high' },
    { department: 'Logistics', task_title: 'Music system setup', priority: 'normal' },
  ],
  custom: [
    { department: 'General', task_title: 'Basic venue check', priority: 'normal' },
    { department: 'Logistics', task_title: 'Power and sound check', priority: 'high' },
  ]
}

export function getTemplateForProgram(programType: ProgramNameType): ChecklistTemplateItem[] {
  return GENERIC_TEMPLATES[programType] || GENERIC_TEMPLATES.default
}
