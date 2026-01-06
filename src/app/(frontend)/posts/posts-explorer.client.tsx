'use client'

import Link from 'next/link'
import React, { useMemo, useState } from 'react'
import { Binary, Bug, Database, Folder, Lock, Network, Shield, Terminal } from 'lucide-react'

import { Card, type CardPostData } from '@/components/Card'

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

export type PostsExplorerPost = CardPostData & {
  id: string
  publishedAt?: string | null
  createdAt?: string | null
  readTime?: number | null
}

export type PostsExplorerCategory = {
  id: string
  title: string
  slug: string
  description?: string | null
  icon?: CategoryIcon | null
  badge?: string | null
  featured: boolean
  sortOrder: number
  count: number
  latestPostAt: number
  posts: PostsExplorerPost[]
}

type SortMode = 'newest' | 'popular' | 'az'

type Props = {
  categories: PostsExplorerCategory[]
  totalPosts: number
}

const formatDate = (value?: string | null) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const getIcon = (icon?: CategoryIcon | null) => iconMap[icon ?? 'folder'] ?? Folder

const CategoryIconBadge = ({ icon }: { icon?: CategoryIcon | null }) => {
  const Icon = getIcon(icon)
  return <Icon className="h-4 w-4 text-muted-foreground" />
}

const PostMetaRow = ({ post }: { post: PostsExplorerPost }) => {
  const label = formatDate(post.publishedAt ?? post.createdAt)
  const readTime = post.readTime

  if (!label && !readTime) return null

  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      {label ? <span>{label}</span> : null}
      {label && readTime ? <span aria-hidden="true">|</span> : null}
      {readTime ? <span>{readTime} min read</span> : null}
    </div>
  )
}

const PostsGrid = ({ posts }: { posts: PostsExplorerPost[] }) => {
  if (posts.length === 0) {
    return <div className="text-sm text-muted-foreground">No posts yet.</div>
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
      {posts.map((post) => (
        <div className="col-span-4 space-y-2" key={post.id}>
          <Card className="h-full" doc={post} relationTo="posts" showCategories />
          <PostMetaRow post={post} />
        </div>
      ))}
    </div>
  )
}

export default function PostsExplorer({ categories, totalPosts }: Props) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortMode>('newest')

  const featured = useMemo(() => {
    return [...categories]
      .filter((category) => category.featured)
      .sort((a, b) => a.sortOrder - b.sortOrder || b.count - a.count)
      .slice(0, 6)
  }, [categories])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return categories
    return categories.filter((category) => {
      const description = category.description?.toLowerCase() ?? ''
      const badge = category.badge?.toLowerCase() ?? ''
      return (
        category.title.toLowerCase().includes(q) ||
        category.slug.toLowerCase().includes(q) ||
        description.includes(q) ||
        badge.includes(q)
      )
    })
  }, [categories, query])

  const sorted = useMemo(() => {
    const list = [...filtered]
    list.sort((a, b) => {
      if (sort === 'newest') {
        return b.latestPostAt - a.latestPostAt || a.title.localeCompare(b.title)
      }
      if (sort === 'popular') {
        return b.count - a.count || a.title.localeCompare(b.title)
      }
      return a.title.localeCompare(b.title)
    })
    return list
  }, [filtered, sort])

  return (
    <section className="space-y-10">
      <header className="space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
          Archive
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Posts</h1>

        <p className="max-w-2xl text-base sm:text-lg text-muted-foreground">
          Browse posts by topic, follow a trail of related categories, and jump straight to the
          techniques you need.
        </p>

        <div className="flex flex-wrap gap-3">
          <StatPill label="Posts" value={totalPosts} />
          <StatPill label="Categories" value={categories.length} />
          <Link
            href="/categories"
            className="inline-flex items-center rounded-full border px-4 py-2 text-sm hover:bg-muted transition-colors"
          >
            Browse all categories
          </Link>
        </div>
      </header>

      {featured.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Featured categories</h2>
            <Link href="/categories" className="text-sm text-muted-foreground underline">
              View all
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {featured.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group relative overflow-hidden rounded-2xl border p-5 hover:shadow-sm transition-shadow"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-muted/40 to-transparent" />
                <div className="relative space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-background">
                      <CategoryIconBadge icon={category.icon} />
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-medium">#{category.slug}</span>
                    </span>

                    {category.badge ? (
                      <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-muted-foreground">
                        {category.badge}
                      </span>
                    ) : null}
                  </div>

                  <div className="text-xl font-semibold">{category.title}</div>

                  {category.description ? (
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  ) : null}

                  <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
                    <span>
                      {category.count} post{category.count === 1 ? '' : 's'}
                    </span>
                    <span className="underline underline-offset-4 opacity-80 group-hover:opacity-100">
                      View posts
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="sticky top-20 z-20 -mx-4 border-y bg-background/90 px-4 py-4 backdrop-blur">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl w-full">
              <label className="sr-only" htmlFor="posts-search">
                Search categories
              </label>
              <input
                id="posts-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search categories or keywords..."
                className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>
                Showing <span className="font-medium text-foreground">{sorted.length}</span>{' '}
                categories
              </span>
              <select
                className="rounded-lg border bg-background px-3 py-2 text-sm text-foreground"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortMode)}
                aria-label="Sort categories"
              >
                <option value="newest">Newest updates</option>
                <option value="popular">Most posts</option>
                <option value="az">A-Z</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {sorted.map((category) => (
              <a
                key={category.id}
                href={`#category-${category.slug}`}
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>{category.title}</span>
                <span className="text-[11px]">({category.count})</span>
              </a>
            ))}
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              All categories
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-36 space-y-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Category index
            </div>
            <nav className="space-y-2 text-sm">
              {sorted.map((category) => (
                <a
                  key={category.id}
                  href={`#category-${category.slug}`}
                  className="flex items-center justify-between rounded-lg px-2 py-1 hover:bg-muted/60"
                >
                  <span className="truncate">{category.title}</span>
                  <span className="text-xs text-muted-foreground">{category.count}</span>
                </a>
              ))}
            </nav>
            <Link href="/categories" className="text-xs text-muted-foreground underline">
              View all categories
            </Link>
          </div>
        </aside>

        <div className="space-y-16">
          {sorted.length === 0 ? (
            <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
              {query.trim() ? 'No categories match your search.' : 'No posts found.'}
            </div>
          ) : null}

          {sorted.map((category) => (
            <section
              key={category.id}
              id={`category-${category.slug}`}
              className="scroll-mt-32 space-y-6"
            >
              <div className="flex flex-col gap-3 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-background">
                    <CategoryIconBadge icon={category.icon} />
                  </span>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-semibold">{category.title}</h2>
                      {category.badge ? (
                        <span className="inline-flex rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                          {category.badge}
                        </span>
                      ) : null}
                    </div>

                    {category.description ? (
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    ) : null}

                    <div className="text-xs text-muted-foreground">/categories/{category.slug}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>
                    {category.count} post{category.count === 1 ? '' : 's'}
                  </span>
                  <Link href={`/categories/${category.slug}`} className="underline">
                    View category
                  </Link>
                </div>
              </div>

              <PostsGrid posts={category.posts} />
            </section>
          ))}
        </div>
      </div>
    </section>
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
