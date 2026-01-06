'use client'

import React, { useMemo, useState } from 'react'

import { Card, type CardPostData } from '@/components/Card'

export type CategoryPostSummary = CardPostData & {
  id: string
  publishedAt?: string | null
  createdAt?: string | null
  readTime?: number | null
}

type SortMode = 'newest' | 'popular' | 'az'
type ViewMode = 'grid' | 'list'

type Props = {
  posts: CategoryPostSummary[]
  totalPosts: number
}

const getPostDate = (post: CategoryPostSummary) => {
  const value = post.publishedAt ?? post.createdAt
  if (!value) return 0
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
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

const PostMetaRow = ({ post }: { post: CategoryPostSummary }) => {
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

const getAnchorId = (post: CategoryPostSummary) => `post-${post.slug ?? post.id}`

export default function CategoryPostsExplorer({ posts, totalPosts }: Props) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortMode>('newest')
  const [view, setView] = useState<ViewMode>('grid')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return posts
    return posts.filter((post) => {
      const title = post.title?.toLowerCase() ?? ''
      const slug = post.slug?.toLowerCase() ?? ''
      const description = post.meta?.description?.toLowerCase() ?? ''
      return title.includes(q) || slug.includes(q) || description.includes(q)
    })
  }, [posts, query])

  const sorted = useMemo(() => {
    const list = [...filtered]

    list.sort((a, b) => {
      if (sort === 'newest') return getPostDate(b) - getPostDate(a)
      if (sort === 'popular') {
        const readDiff = (b.readTime ?? 0) - (a.readTime ?? 0)
        if (readDiff !== 0) return readDiff
        return getPostDate(b) - getPostDate(a)
      }
      return (a.title ?? '').localeCompare(b.title ?? '')
    })

    return list
  }, [filtered, sort])

  const topPosts = useMemo(() => sorted.slice(0, 5), [sorted])

  const gridClassName =
    view === 'grid'
      ? 'grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8'
      : 'grid grid-cols-1 gap-6'

  const itemClassName = view === 'grid' ? 'col-span-4 space-y-2' : 'space-y-2'

  return (
    <section className="space-y-8">
      <div className="sticky top-20 z-20 -mx-4 border-y bg-background/90 px-4 py-4 backdrop-blur">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl w-full">
              <label className="sr-only" htmlFor="category-posts-search">
                Search posts
              </label>
              <input
                id="category-posts-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search posts in this category..."
                className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>
                Showing <span className="font-medium text-foreground">{sorted.length}</span> of{' '}
                {totalPosts}
              </span>

              <select
                className="rounded-lg border bg-background px-3 py-2 text-sm text-foreground"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortMode)}
                aria-label="Sort posts"
              >
                <option value="newest">Newest</option>
                <option value="popular">Popular</option>
                <option value="az">A-Z</option>
              </select>

              <div className="inline-flex items-center rounded-lg border bg-background p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setView('grid')}
                  className={`px-3 py-1 rounded-md ${
                    view === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground'
                  }`}
                  aria-pressed={view === 'grid'}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className={`px-3 py-1 rounded-md ${
                    view === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground'
                  }`}
                  aria-pressed={view === 'list'}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {topPosts.length > 0 ? (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-muted-foreground">
              <span className="shrink-0">Jump to:</span>
              {topPosts.map((post) => (
                <a
                  key={post.id}
                  href={`#${getAnchorId(post)}`}
                  className="inline-flex items-center rounded-full border px-3 py-1 hover:text-foreground transition-colors"
                >
                  {post.title ?? 'Untitled'}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_240px]">
        <div className="space-y-6">
          {sorted.length === 0 ? (
            <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
              {query.trim() ? 'No posts match your search.' : 'No posts found.'}
            </div>
          ) : (
            <div className={gridClassName}>
              {sorted.map((post) => (
                <div key={post.id} id={getAnchorId(post)} className={`scroll-mt-32 ${itemClassName}`}>
                  <Card className="h-full" doc={post} relationTo="posts" showCategories />
                  <PostMetaRow post={post} />
                </div>
              ))}
            </div>
          )}
        </div>

        {topPosts.length > 0 ? (
          <aside className="hidden lg:block">
            <div className="sticky top-36 space-y-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Top posts</div>
              <nav className="space-y-2 text-sm">
                {topPosts.map((post) => (
                  <a
                    key={post.id}
                    href={`#${getAnchorId(post)}`}
                    className="block rounded-lg px-2 py-1 hover:bg-muted/60"
                  >
                    {post.title ?? 'Untitled'}
                  </a>
                ))}
              </nav>
              <a href="#top" className="text-xs text-muted-foreground underline">
                Back to top
              </a>
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  )
}
