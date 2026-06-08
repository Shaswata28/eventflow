export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Enums: {
            user_role: 'managing_director' | 'finance_manager' | 'client_comms' | 'vendor_manager' | 'operations' | 'decoration' | 'design'
            client_status: 'lead' | 'consultation' | 'confirmed' | 'completed' | 'archived'
            event_type: 'wedding' | 'corporate' | 'birthday' | 'other'
            program_name_type: 'holud' | 'mehendi' | 'reception' | 'engagement' | 'corporate' | 'birthday' | 'custom'
            program_status: 'planning' | 'vendors_sourcing' | 'vendors_confirmed' | 'ready' | 'live' | 'completed' | 'cancelled'
            quotation_status: 'draft' | 'internal_review' | 'sent_to_client' | 'approved' | 'rejected'
            assignment_status: 'pending_approval' | 'approved' | 'confirmed' | 'paid' | 'completed' | 'rejected'
            approval_level: 'finance' | 'md'
            approval_status: 'pending' | 'approved' | 'rejected'
            document_label: 'bill' | 'receipt' | 'contract' | 'quotation' | 'agreement' | 'reference' | 'other'
            task_priority: 'high' | 'normal' | 'low'
            vendor_category: 'decor' | 'catering' | 'photography' | 'cinematography' | 'sound' | 'lighting' | 'flowers' | 'transport' | 'printing' | 'venue' | 'other'
        }
        Tables: {
            user_profiles: {
                Row: {
                    id: string
                    name: string
                    role: Database['public']['Enums']['user_role']
                    phone: string | null
                    avatar_url: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    name: string
                    role: Database['public']['Enums']['user_role']
                    phone?: string | null
                    avatar_url?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    role?: Database['public']['Enums']['user_role']
                    phone?: string | null
                    avatar_url?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            clients: {
                Row: {
                    id: string
                    client_code: string
                    full_name: string
                    bride_name: string | null
                    groom_name: string | null
                    phone_primary: string
                    phone_secondary: string | null
                    email: string | null
                    event_type: Database['public']['Enums']['event_type']
                    budget_range: string | null
                    status: Database['public']['Enums']['client_status']
                    assigned_to: string | null
                    created_by: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    client_code?: string
                    full_name: string
                    bride_name?: string | null
                    groom_name?: string | null
                    phone_primary: string
                    phone_secondary?: string | null
                    email?: string | null
                    event_type: Database['public']['Enums']['event_type']
                    budget_range?: string | null
                    status?: Database['public']['Enums']['client_status']
                    assigned_to?: string | null
                    created_by: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    client_code?: string
                    full_name?: string
                    bride_name?: string | null
                    groom_name?: string | null
                    phone_primary?: string
                    phone_secondary?: string | null
                    email?: string | null
                    event_type?: Database['public']['Enums']['event_type']
                    budget_range?: string | null
                    status?: Database['public']['Enums']['client_status']
                    assigned_to?: string | null
                    created_by?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            consultation_notes: {
                Row: {
                    id: string
                    client_id: string
                    content: string
                    content_type: string
                    author_id: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    client_id: string
                    content: string
                    content_type?: string
                    author_id: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    client_id?: string
                    content?: string
                    content_type?: string
                    author_id?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            event_programs: {
                Row: {
                    id: string
                    client_id: string
                    program_name: Database['public']['Enums']['program_name_type']
                    custom_name: string | null
                    event_date: string
                    venue_name: string | null
                    venue_address: string | null
                    guest_count: number | null
                    theme_notes: string | null
                    responsible_partner: string | null
                    status: Database['public']['Enums']['program_status']
                    created_by: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    client_id: string
                    program_name: Database['public']['Enums']['program_name_type']
                    custom_name?: string | null
                    event_date: string
                    venue_name?: string | null
                    venue_address?: string | null
                    guest_count?: number | null
                    theme_notes?: string | null
                    responsible_partner?: string | null
                    status?: Database['public']['Enums']['program_status']
                    created_by: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    client_id?: string
                    program_name?: Database['public']['Enums']['program_name_type']
                    custom_name?: string | null
                    event_date?: string
                    venue_name?: string | null
                    venue_address?: string | null
                    guest_count?: number | null
                    theme_notes?: string | null
                    responsible_partner?: string | null
                    status?: Database['public']['Enums']['program_status']
                    created_by?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            quotations: {
                Row: {
                    id: string
                    program_id: string
                    version: number
                    status: Database['public']['Enums']['quotation_status']
                    total_amount: number | null
                    advance_amount: number | null
                    notes: string | null
                    created_by: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    program_id: string
                    version?: number
                    status?: Database['public']['Enums']['quotation_status']
                    total_amount?: number | null
                    advance_amount?: number | null
                    notes?: string | null
                    created_by: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    program_id?: string
                    version?: number
                    status?: Database['public']['Enums']['quotation_status']
                    total_amount?: number | null
                    advance_amount?: number | null
                    notes?: string | null
                    created_by?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            quotation_items: {
                Row: {
                    id: string
                    quotation_id: string
                    category: Database['public']['Enums']['vendor_category']
                    description: string | null
                    amount: number
                    sort_order: number | null
                }
                Insert: {
                    id?: string
                    quotation_id: string
                    category: Database['public']['Enums']['vendor_category']
                    description?: string | null
                    amount: number
                    sort_order?: number | null
                }
                Update: {
                    id?: string
                    quotation_id?: string
                    category?: Database['public']['Enums']['vendor_category']
                    description?: string | null
                    amount?: number
                    sort_order?: number | null
                }
            }
            service_categories: {
                Row: {
                    id: string
                    program_id: string
                    category: Database['public']['Enums']['vendor_category']
                    custom_label: string | null
                    allocated_budget: number
                    assigned_to: string | null
                    status: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    program_id: string
                    category: Database['public']['Enums']['vendor_category']
                    custom_label?: string | null
                    allocated_budget: number
                    assigned_to?: string | null
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    program_id?: string
                    category?: Database['public']['Enums']['vendor_category']
                    custom_label?: string | null
                    allocated_budget?: number
                    assigned_to?: string | null
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            vendors: {
                Row: {
                    id: string
                    name: string
                    category: Database['public']['Enums']['vendor_category']
                    phone_primary: string | null
                    phone_secondary: string | null
                    location: string | null
                    area: string | null
                    last_used_price: number | null
                    rating: number | null
                    notes: string | null
                    is_active: boolean
                    added_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    category: Database['public']['Enums']['vendor_category']
                    phone_primary?: string | null
                    phone_secondary?: string | null
                    location?: string | null
                    area?: string | null
                    last_used_price?: number | null
                    rating?: number | null
                    notes?: string | null
                    is_active?: boolean
                    added_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    category?: Database['public']['Enums']['vendor_category']
                    phone_primary?: string | null
                    phone_secondary?: string | null
                    location?: string | null
                    area?: string | null
                    last_used_price?: number | null
                    rating?: number | null
                    notes?: string | null
                    is_active?: boolean
                    added_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            vendor_assignments: {
                Row: {
                    id: string
                    service_category_id: string
                    vendor_id: string | null
                    vendor_name_override: string | null
                    vendor_phone_override: string | null
                    quoted_price: number
                    advance_paid: number | null
                    remaining_balance: number | null
                    status: Database['public']['Enums']['assignment_status']
                    notes: string | null
                    requested_by: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    service_category_id: string
                    vendor_id?: string | null
                    vendor_name_override?: string | null
                    vendor_phone_override?: string | null
                    quoted_price: number
                    advance_paid?: number | null
                    status?: Database['public']['Enums']['assignment_status']
                    notes?: string | null
                    requested_by: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    service_category_id?: string
                    vendor_id?: string | null
                    vendor_name_override?: string | null
                    vendor_phone_override?: string | null
                    quoted_price?: number
                    advance_paid?: number | null
                    status?: Database['public']['Enums']['assignment_status']
                    notes?: string | null
                    requested_by?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            approval_requests: {
                Row: {
                    id: string
                    vendor_assignment_id: string
                    approval_level: Database['public']['Enums']['approval_level']
                    approver_id: string
                    status: Database['public']['Enums']['approval_status']
                    note: string | null
                    requested_at: string
                    resolved_at: string | null
                }
                Insert: {
                    id?: string
                    vendor_assignment_id: string
                    approval_level: Database['public']['Enums']['approval_level']
                    approver_id: string
                    status?: Database['public']['Enums']['approval_status']
                    note?: string | null
                    requested_at?: string
                    resolved_at?: string | null
                }
                Update: {
                    id?: string
                    vendor_assignment_id?: string
                    approval_level?: Database['public']['Enums']['approval_level']
                    approver_id?: string
                    status?: Database['public']['Enums']['approval_status']
                    note?: string | null
                    requested_at?: string
                    resolved_at?: string | null
                }
            }
            documents: {
                Row: {
                    id: string
                    vendor_assignment_id: string | null
                    program_id: string | null
                    client_id: string | null
                    label: Database['public']['Enums']['document_label']
                    file_name: string
                    file_url: string
                    file_type: string
                    file_size_bytes: number | null
                    uploaded_by: string
                    uploaded_at: string
                }
                Insert: {
                    id?: string
                    vendor_assignment_id?: string | null
                    program_id?: string | null
                    client_id?: string | null
                    label?: Database['public']['Enums']['document_label']
                    file_name: string
                    file_url: string
                    file_type: string
                    file_size_bytes?: number | null
                    uploaded_by: string
                    uploaded_at?: string
                }
                Update: {
                    id?: string
                    vendor_assignment_id?: string | null
                    program_id?: string | null
                    client_id?: string | null
                    label?: Database['public']['Enums']['document_label']
                    file_name?: string
                    file_url?: string
                    file_type?: string
                    file_size_bytes?: number | null
                    uploaded_by?: string
                    uploaded_at?: string
                }
            }
            event_checklists: {
                Row: {
                    id: string
                    program_id: string
                    department: string
                    task_title: string
                    priority: Database['public']['Enums']['task_priority']
                    assigned_to: string | null
                    due_time: string | null
                    is_done: boolean
                    done_by: string | null
                    done_at: string | null
                    flag_note: string | null
                    sort_order: number | null
                    created_by: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    program_id: string
                    department: string
                    task_title: string
                    priority?: Database['public']['Enums']['task_priority']
                    assigned_to?: string | null
                    due_time?: string | null
                    is_done?: boolean
                    done_by?: string | null
                    done_at?: string | null
                    flag_note?: string | null
                    sort_order?: number | null
                    created_by: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    program_id?: string
                    department?: string
                    task_title?: string
                    priority?: Database['public']['Enums']['task_priority']
                    assigned_to?: string | null
                    due_time?: string | null
                    is_done?: boolean
                    done_by?: string | null
                    done_at?: string | null
                    flag_note?: string | null
                    sort_order?: number | null
                    created_by?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            activity_log: {
                Row: {
                    id: string
                    actor_id: string | null
                    entity_type: string
                    entity_id: string
                    action: string
                    description: string
                    metadata: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    actor_id?: string | null
                    entity_type: string
                    entity_id: string
                    action: string
                    description: string
                    metadata?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    actor_id?: string | null
                    entity_type?: string
                    entity_id?: string
                    action?: string
                    description?: string
                    metadata?: Json | null
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            get_user_role: {
                Args: Record<PropertyKey, never>
                Returns: Database['public']['Enums']['user_role']
            }
        }
    }
}