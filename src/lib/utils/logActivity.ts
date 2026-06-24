import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

type ActivityLogInsert = Database['public']['Tables']['activity_log']['Insert']

export interface LogPayload {
  actorId?: string | null
  entityType: string
  entityId: string
  action: string
  description: string
  metadata?: Record<string, unknown>
}

/**
 * Shared utility to fire-and-forget an activity log entry.
 * It silently catches errors so it doesn't interrupt the main mutation flow.
 */
export async function logActivity(
  supabase: SupabaseClient<Database>,
  payload: LogPayload
) {
  try {
    let finalActorId = payload.actorId

    // If no actorId is provided, try to fetch the current user's session
    if (!finalActorId) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        finalActorId = session.user.id
      }
    }

    const logEntry: ActivityLogInsert = {
      actor_id: finalActorId || null,
      entity_type: payload.entityType,
      entity_id: payload.entityId,
      action: payload.action,
      description: payload.description,
      metadata: payload.metadata || null,
    }

    const { error } = await supabase
      .from('activity_log')
      .insert(logEntry)

    if (error) {
      console.warn('Failed to insert activity log:', error.message)
    }
  } catch (err) {
    console.warn('Error in logActivity:', err)
  }
}
