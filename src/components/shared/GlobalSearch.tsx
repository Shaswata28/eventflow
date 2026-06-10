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

// ─── Type enums ────────────────────────────────────────────────────────────

const VENDOR_CATEGORIES = [
  "decor",
  "catering",
  "photography",
  "cinematography",
  "sound",
  "lighting",
  "flowers",
  "transport",
  "printing",
  "venue",
  "other",
] as const
type VendorCategory = (typeof VENDOR_CATEGORIES)[number]

const EVENT_TYPES = ["wedding", "corporate", "birthday", "other"] as const
type EventType = (typeof EVENT_TYPES)[number]

const PROGRAM_TYPES = [
  "holud",
  "mehendi",
  "reception",
  "engagement",
  "corporate",
  "birthday",
  "custom",
] as const
type ProgramType = (typeof PROGRAM_TYPES)[number]

// ─── Smart query analysis ──────────────────────────────────────────────────

function analyzeQuery(query: string): {
  vendorCategory: VendorCategory | null
  eventType: EventType | null
  programType: ProgramType | null
  textQuery: string
} {
  const q = query.trim().toLowerCase()

  // Check if the query exactly matches (or starts with) a known category/type
  const vendorCategory =
    (VENDOR_CATEGORIES.find((c) => c.startsWith(q) && q.length >= 3) as VendorCategory) ?? null
  const eventType =
    (EVENT_TYPES.find((t) => t.startsWith(q) && q.length >= 3) as EventType) ?? null
  const programType =
    (PROGRAM_TYPES.find((t) => t.startsWith(q) && q.length >= 3) as ProgramType) ?? null

  return { vendorCategory, eventType, programType, textQuery: q }
}

// ─── Category label helpers ────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  decor: "Decor",
  catering: "Catering",
  photography: "Photography",
  cinematography: "Cinematography",
  sound: "Sound",
  lighting: "Lighting",
  flowers: "Flowers",
  transport: "Transport",
  printing: "Printing",
  venue: "Venue",
  other: "Other",
  wedding: "Wedding",
  corporate: "Corporate",
  birthday: "Birthday",
  holud: "Holud",
  mehendi: "Mehendi",
  reception: "Reception",
  engagement: "Engagement",
  custom: "Custom",
}

function CategoryBadge({ value }: { value: string }) {
  return (
    <span className="ml-auto text-[11px] font-medium capitalize px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
      {CATEGORY_LABELS[value] ?? value}
    </span>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const router = useRouter()
  const supabase = createClient()

  const { vendorCategory, eventType, programType, textQuery } = analyzeQuery(query)

  // When the query matches a category keyword, we search by category instead of text
  const isVendorCategorySearch = vendorCategory !== null
  const isEventTypeSearch = eventType !== null
  const isProgramTypeSearch = programType !== null

  const { data: results, isLoading } = useQuery({
    queryKey: ["global-search", textQuery, vendorCategory, eventType, programType],
    queryFn: async () => {
      const searchTerm = `%${textQuery}%`

      // ── Vendors ──────────────────────────────────────────────────────────
      let vendorQ = supabase.from("vendors").select("id, name, category").limit(8)
      if (isVendorCategorySearch) {
        // Filter by detected category (e.g. user typed "photo" → photography)
        vendorQ = vendorQ.eq("category", vendorCategory!)
      } else {
        vendorQ = vendorQ.ilike("name", searchTerm)
      }

      // ── Clients ───────────────────────────────────────────────────────────
      let clientQ = supabase
        .from("clients")
        .select("id, full_name, client_code, event_type")
        .limit(6)
      if (isEventTypeSearch) {
        clientQ = clientQ.eq("event_type", eventType!)
      } else {
        clientQ = clientQ.ilike("full_name", searchTerm)
      }

      // ── Programs ──────────────────────────────────────────────────────────
      let programQ = supabase
        .from("event_programs")
        .select("id, client_id, custom_name, program_name, venue_name")
        .limit(6)
      if (isProgramTypeSearch) {
        programQ = programQ.eq("program_name", programType!)
      } else {
        programQ = programQ.or(
          `custom_name.ilike.${searchTerm},venue_name.ilike.${searchTerm}`
        )
      }

      const [vendorsRes, clientsRes, programsRes] = await Promise.all([
        vendorQ,
        clientQ,
        programQ,
      ])

      return {
        vendors: (vendorsRes.data ?? []) as any[],
        clients: (clientsRes.data ?? []) as any[],
        programs: (programsRes.data ?? []) as any[],
        // Pass through so the UI can show a "Showing all X vendors" hint
        isVendorCategorySearch,
        isEventTypeSearch,
        isProgramTypeSearch,
        vendorCategory,
        eventType,
        programType,
      }
    },
    enabled: textQuery.length >= 2,
  })

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) setTimeout(() => setQuery(""), 200)
  }

  const handleSelect = (path: string) => {
    handleOpenChange(false)
    router.push(path)
  }

  const hasResults =
    (results?.vendors?.length ?? 0) > 0 ||
    (results?.clients?.length ?? 0) > 0 ||
    (results?.programs?.length ?? 0) > 0

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 border border-gray-200/50 dark:border-gray-800 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 px-4 py-2 relative h-10 w-full justify-start rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-sm font-normal text-gray-500 dark:text-gray-400 shadow-sm sm:pr-12 md:w-48 lg:w-72 group"
      >
        <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
        <span className="hidden lg:inline-flex">Search anything...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-[0.35rem] top-[0.4rem] hidden h-6 select-none items-center gap-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 font-mono text-[10px] font-medium opacity-100 sm:flex shadow-sm">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Dialog */}
      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder='Search by name, or type "decor", "wedding", "holud"...'
            value={query}
            onValueChange={setQuery}
          />

          <CommandList>
            {isLoading && textQuery.length >= 2 && (
              <div className="py-6 text-sm text-center text-muted-foreground animate-pulse">
                Searching...
              </div>
            )}

            {!isLoading && textQuery.length >= 2 && !hasResults && (
              <CommandEmpty>No results found for &ldquo;{query}&rdquo;.</CommandEmpty>
            )}

            {/* Vendors */}
            {results?.vendors && results.vendors.length > 0 && (
              <CommandGroup
                heading={
                  results.isVendorCategorySearch
                    ? `${CATEGORY_LABELS[results.vendorCategory!]} Vendors`
                    : "Vendors"
                }
              >
                {results.vendors.map((vendor) => (
                  <CommandItem
                    key={vendor.id}
                    onSelect={() => handleSelect(`/dashboard/vendors/${vendor.id}`)}
                  >
                    <Briefcase className="mr-2 h-4 w-4 text-indigo-500 shrink-0" />
                    <span>{vendor.name}</span>
                    {!results.isVendorCategorySearch && (
                      <CategoryBadge value={vendor.category} />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Clients */}
            {results?.clients && results.clients.length > 0 && (
              <CommandGroup
                heading={
                  results.isEventTypeSearch
                    ? `${CATEGORY_LABELS[results.eventType!]} Events`
                    : "Clients"
                }
              >
                {results.clients.map((client) => (
                  <CommandItem
                    key={client.id}
                    onSelect={() => handleSelect(`/dashboard/clients/${client.id}`)}
                  >
                    <User className="mr-2 h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{client.full_name}</span>
                    <div className="ml-auto flex items-center gap-1.5 shrink-0">
                      {!results.isEventTypeSearch && (
                        <CategoryBadge value={client.event_type} />
                      )}
                      <span className="text-xs text-muted-foreground">
                        ({client.client_code})
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Programs */}
            {results?.programs && results.programs.length > 0 && (
              <CommandGroup
                heading={
                  results.isProgramTypeSearch
                    ? `${CATEGORY_LABELS[results.programType!]} Programs`
                    : "Programs"
                }
              >
                {results.programs.map((program) => (
                  <CommandItem
                    key={program.id}
                    onSelect={() =>
                      handleSelect(
                        `/dashboard/clients/${program.client_id}/programs/${program.id}`
                      )
                    }
                  >
                    <Calendar className="mr-2 h-4 w-4 text-amber-500 shrink-0" />
                    <span className="capitalize">
                      {program.custom_name || program.program_name}
                    </span>
                    <div className="ml-auto flex items-center gap-1.5 shrink-0">
                      {!results.isProgramTypeSearch && (
                        <CategoryBadge value={program.program_name} />
                      )}
                      {program.venue_name && (
                        <span className="text-xs text-muted-foreground">
                          @ {program.venue_name}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Idle hint */}
            {textQuery.length < 2 && (
              <div className="py-8 text-center space-y-3">
                <Search className="mx-auto h-8 w-8 text-muted-foreground/30" />
                <div>
                  <p className="text-sm text-muted-foreground">Search anything</p>
                </div>
              </div>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
