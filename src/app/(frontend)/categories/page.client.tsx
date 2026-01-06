'use client'

import React, { useMemo, useState } from 'react'
import { Binary, Bug, Database, Folder, Lock, Network, Shield, Terminal } from 'lucide-react'

const iconMap = {
  folder: Folder,
  terminal: Terminal,
  shield: Shield,
  bug: Bug,
  network: Network,
  lock: Lock,
  binary: Binary,
  database: Database,
} as const

type CategoryIcon = keyof typeof iconMap

export type CategoryIndexItem = {
  id: string
  title: string
  slug: string
  description?: string | null
  icon?: CategoryIcon | null
  badge?: string | null
  featured: boolean
  sortOrder: number
  count: number
}

const getIcon = (icon?: CategoryIcon | null) => iconMap[icon ?? 'folder'] ?? Folder

const CategoryIcon = ({ icon }: { icon?: CategoryIcon | null }) => {
  const Icon = getIcon(icon)
  return <Icon className="h-4 w-4 text-muted-foreground" />
}

export default function CategoriesClient({ categories }: { categories: CategoryIndexItem[] }) {
  const [q, setQ] = useState('')

  const featured = useMemo(() => categories.filter((c) => c.featured).slice(0, 3), [categories])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return categories
    return categories.filter((c) => {
      const description = c.description?.toLowerCase() ?? ''
      const badge = c.badge?.toLowerCase() ?? ''
      return (
        c.title.toLowerCase().includes(query) ||
        c.slug.toLowerCase().includes(query) ||
        description.includes(query) ||
        badge.includes(query)
      )
    })
  }, [q, categories])

  return (
    <section className="space-y-8">
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="max-w-xl w-full">
          <label className="sr-only" htmlFor="category-search">
            Search categories
          </label>
          <input
            id="category-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search categories (e.g., boot2root, web, active directory)…"
            className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filtered.length}</span> categories
        </div>
      </div>

      {/* Featured */}
      {featured.length > 0 && !q.trim() ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Featured</h2>
            <span className="text-xs text-muted-foreground">Featured categories</span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {featured.map((c) => (
              <a
                key={c.id}
                href={`/categories/${c.slug}`}
                className="group relative overflow-hidden rounded-2xl border p-5 hover:shadow-sm transition-shadow"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-muted/40 to-transparent" />
                <div className="relative space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-background">
                      <CategoryIcon icon={c.icon} />
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-medium">#{c.slug}</span>
                    </span>

                    {c.badge ? (
                      <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-muted-foreground">
                        {c.badge}
                      </span>
                    ) : null}
                  </div>

                  <div className="text-xl font-semibold">{c.title}</div>

                  {c.description ? (
                    <p className="text-sm text-muted-foreground">{c.description}</p>
                  ) : null}

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm text-muted-foreground">
                      {c.count} post{c.count === 1 ? '' : 's'}
                    </div>
                    <div className="text-sm underline underline-offset-4 opacity-80 group-hover:opacity-100">
                      View →
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <a
            key={c.id}
            href={`/categories/${c.slug}`}
            className="group rounded-2xl border p-5 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-background">
                    <CategoryIcon icon={c.icon} />
                  </span>

                  <div className="space-y-1">
                    <div className="text-lg font-semibold leading-tight">{c.title}</div>
                    <div className="text-xs text-muted-foreground">/categories/{c.slug}</div>
                  </div>
                </div>

                {c.description ? (
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                ) : null}

                {c.badge ? (
                  <span className="inline-flex rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                    {c.badge}
                  </span>
                ) : null}
              </div>

              <div className="shrink-0 rounded-full border px-3 py-1 text-xs text-muted-foreground">
                {c.count} post{c.count === 1 ? '' : 's'}
              </div>
            </div>

            <div className="mt-4 text-sm underline underline-offset-4 opacity-80 group-hover:opacity-100">
              View posts →
            </div>
          </a>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
          No categories match your search.
        </div>
      ) : null}
    </section>
  )
}
