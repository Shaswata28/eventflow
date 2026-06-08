import { format } from 'date-fns'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'N/A'
  return format(new Date(dateString), 'MMM dd, yyyy')
}

export function formatDateTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'N/A'
  return format(new Date(dateString), 'MMM dd, yyyy h:mm a')
}
