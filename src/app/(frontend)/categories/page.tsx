import type { Metadata } from 'next/types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import CategoriesClient, { type CategoryIndexItem } from './page.client'
import Link from 'next/link'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function CategoriesIndexPage() {
  const payload = await getPayload({ config: configPromise })

  const categoriesRes = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 200,
    pagination: false,
    overrideAccess: false,
    sort: 'title',
    select: {
      id: true,
      title: true,
      slug: true,
      breadcrumbs: true,
    },
  })

  // Fetch all posts once; compute counts client-side for categories
  // (efficient and simpler than N queries)
  const postsRes = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: 2000, // plenty for a personal blog; raise if needed
    pagination: false,
    overrideAccess: false,
    select: {
      categories: true,
    },
  })

  const counts = new Map<string, number>() // categoryId -> count

  for (const post of postsRes.docs ?? []) {
    const cats = (post as any).categories

    // Relationship field can be an array of IDs or objects depending on config.
    const ids: string[] = Array.isArray(cats)
      ? cats.map((c: any) => (typeof c === 'string' ? c : c?.id)).filter(Boolean)
      : []

    for (const id of ids) {
      counts.set(id, (counts.get(id) ?? 0) + 1)
    }
  }

  const categories: CategoryIndexItem[] = (categoriesRes.docs ?? [])
    .map((c: any) => ({
      id: c.id,
      title: c.title ?? c.slug,
      slug: c.slug,
      count: counts.get(c.id) ?? 0,
    }))
    // show categories that actually have posts (optional)
    .filter((c) => c.count > 0)
    // sort by popularity first, then alphabetically as tie-breaker
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))

  const totalPosts = Array.from(counts.values()).reduce((a, b) => a + b, 0)

  return (
    <main className="pt-24 pb-24">
      <div className="container space-y-10">
        {/* Hero */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
            Browse by topic
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Categories</h1>

          <p className="max-w-2xl text-base sm:text-lg text-muted-foreground">
            Boot2Root write-ups, CTF notes, and techniques—organized so you can find what you need
            fast.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <StatPill label="Categories" value={categories.length} />
            <StatPill label="Posts tagged" value={totalPosts} />
            <Link
              href="/posts"
              className="inline-flex items-center rounded-full border px-4 py-2 text-sm hover:bg-muted transition-colors"
            >
              View all posts →
            </Link>
          </div>
        </header>

        <CategoriesClient categories={categories} />
      </div>
    </main>
  )
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Categories | Nick Chua`,
  }
}
