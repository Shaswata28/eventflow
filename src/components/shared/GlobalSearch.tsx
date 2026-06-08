"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, User, Briefcase, Calendar } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const router = useRouter()
  const supabase = createClient()

  // Use debounce or just direct query since React Query handles caching
  const { data: results, isLoading } = useQuery({
    queryKey: ['global-search', query],
    queryFn: async () => {
      if (!query || query.length < 2) return { clients: [], programs: [], vendors: [] }

      const searchTerm = `%${query}%`

      const [clientsRes, programsRes, vendorsRes] = await Promise.all([
        supabase.from('clients').select('id, full_name, client_code').ilike('full_name', searchTerm).limit(5),
        supabase.from('event_programs').select('id, client_id, custom_name, program_name, venue_name').or(`custom_name.ilike.${searchTerm},venue_name.ilike.${searchTerm}`).limit(5),
        supabase.from('vendors').select('id, name, category').ilike('name', searchTerm).limit(5)
      ])

      return {
        clients: (clientsRes.data || []) as any[],
        programs: (programsRes.data || []) as any[],
        vendors: (vendorsRes.data || []) as any[]
      }
    },
    enabled: query.length >= 2
  })

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Small delay to allow fade out animation before clearing
      setTimeout(() => setQuery(""), 200)
    }
  }

  const handleSelect = (path: string) => {
    handleOpenChange(false)
    router.push(path)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground px-4 py-2 relative h-9 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
      >
        <span className="hidden lg:inline-flex">Search...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Type a command or search..." 
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {isLoading && query.length >= 2 && <div className="p-4 text-sm text-center">Searching...</div>}
            {!isLoading && query.length >= 2 && <CommandEmpty>No results found.</CommandEmpty>}
            
            {results?.clients && results.clients.length > 0 && (
              <CommandGroup heading="Clients">
                {results.clients.map((client) => (
                  <CommandItem
                    key={client.id}
                    onSelect={() => handleSelect(`/dashboard/clients/${client.id}`)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>{client.full_name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">({client.client_code})</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results?.programs && results.programs.length > 0 && (
              <CommandGroup heading="Programs">
                {results.programs.map((program) => (
                  <CommandItem
                    key={program.id}
                    onSelect={() => handleSelect(`/dashboard/clients/${program.client_id}/programs/${program.id}`)}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    <span className="capitalize">{program.custom_name || program.program_name}</span>
                    {program.venue_name && <span className="ml-2 text-xs text-muted-foreground">@ {program.venue_name}</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results?.vendors && results.vendors.length > 0 && (
              <CommandGroup heading="Vendors">
                {results.vendors.map((vendor) => (
                  <CommandItem
                    key={vendor.id}
                    onSelect={() => handleSelect(`/dashboard/vendors/${vendor.id}`)}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    <span>{vendor.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground capitalize">({vendor.category})</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
