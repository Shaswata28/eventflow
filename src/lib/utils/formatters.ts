import { format } from 'date-fns'

export function formatCurrency(amount: number): string {
  // Format as US style numbers (1,000.00) but prepend the Taka symbol
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
  
  return `৳${formatted}`
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'N/A'
  return format(new Date(dateString), 'MMM dd, yyyy')
}

export function formatDateTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'N/A'
  return format(new Date(dateString), 'MMM dd, yyyy h:mm a')
}
