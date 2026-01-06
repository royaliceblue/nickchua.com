import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import React, { cache } from 'react'
import { Binary, Bug, Database, Folder, Lock, Network, Shield, Terminal } from 'lucide-react'

import CategoryPostsExplorer, {
  type CategoryPostSummary,
} from './category-posts.client'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })

  const categories = await payload.find({
    collection: 'categories',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })

  return (categories.docs || []).map((c: any) => ({ slug: c.slug }))
}

type Args = {
  params: Promise<{ slug: string }>
}

export default async function CategoryPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)

  const category = await queryCategoryBySlug({ slug: decodedSlug })
  if (!category) return notFound()

  const posts = await queryPostsByCategoryId({
    categoryId: category.id,
    draft,
  })
  const postSummaries: CategoryPostSummary[] = posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    categories: post.categories ?? [],
    meta: post.meta ?? undefined,
    publishedAt: post.publishedAt ?? null,
    createdAt: post.createdAt ?? null,
    readTime: getReadTime(post.content),
  }))

  const totalPosts = postSummaries.length
  const breadcrumbs = Array.isArray(category.breadcrumbs) ? category.breadcrumbs : []
  const breadcrumbItems = buildBreadcrumbs(breadcrumbs, category.title ?? decodedSlug)
  const relatedCategories = await queryRelatedCategories(category)
  const CategoryIcon = getCategoryIcon(category.icon ?? null)

  return (
    <main className="pt-16 pb-24">
      <div className="container space-y-10" id="top">
        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to categories
            </Link>
            <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-muted-foreground">
              Category
            </span>
            {category.badge ? (
              <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-muted-foreground">
                {category.badge}
              </span>
            ) : null}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border bg-background">
                <CategoryIcon className="h-5 w-5 text-muted-foreground" />
              </span>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  {category.title ?? decodedSlug}
                </h1>
                {category.description ? (
                  <p className="max-w-2xl text-sm sm:text-base text-muted-foreground">
                    {category.description}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <StatPill label="Posts" value={totalPosts} />
                  <Link
                    href="/posts"
                    className="inline-flex items-center rounded-full border px-4 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    View all posts
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {breadcrumbItems.length > 0 ? (
            <nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {breadcrumbItems.map((item, index) =>
                item.href ? (
                  <Link
                    key={`${item.href}-${index}`}
                    href={item.href}
                    className="inline-flex items-center rounded-full border px-3 py-1 hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    key={`${item.label}-${index}`}
                    className="inline-flex items-center rounded-full border px-3 py-1 text-foreground"
                  >
                    {item.label}
                  </span>
                ),
              )}
            </nav>
          ) : null}
        </header>

        {relatedCategories.length > 0 ? (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Related categories</h2>
              <Link href="/categories" className="text-xs text-muted-foreground underline">
                View all
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {relatedCategories.map((related) => {
                const RelatedIcon = getCategoryIcon(related.icon ?? null)
                return (
                  <Link
                    key={related.id}
                    href={`/categories/${related.slug}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-background">
                        <RelatedIcon className="h-4 w-4 text-muted-foreground" />
                      </span>
                      <div>
                        <div className="text-sm font-semibold">{related.title}</div>
                        <div className="text-xs text-muted-foreground">/categories/{related.slug}</div>
                      </div>
                    </div>
                    {related.badge ? (
                      <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-muted-foreground">
                        {related.badge}
                      </span>
                    ) : null}
                  </Link>
                )
              })}
            </div>
          </section>
        ) : null}

        <CategoryPostsExplorer posts={postSummaries} totalPosts={totalPosts} />
      </div>
    </main>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const category = await queryCategoryBySlug({ slug: decodedSlug })

  if (!category) return { title: 'Category not found' }
  const title = category.title ?? decodedSlug

  return {
    title: `${title} | Categories`,
    description: category.description ?? undefined,
  }
}

const queryCategoryBySlug = cache(async ({ slug }: { slug: string }) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'categories',
    limit: 1,
    overrideAccess: false,
    pagination: false,
    depth: 0,
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      icon: true,
      badge: true,
      featured: true,
      sortOrder: true,
      parent: true,
      breadcrumbs: true,
    },
    where: {
      slug: { equals: slug },
    },
  })

  return result.docs?.[0] || null
})

const queryPostsByCategoryId = cache(
  async ({ categoryId, draft }: { categoryId: string; draft: boolean }) => {
    const payload = await getPayload({ config: configPromise })

    // IMPORTANT: this assumes your Posts collection has a relationship field named `categories`
    // Relationship arrays can still be queried with `equals` against the related document ID. :contentReference[oaicite:1]{index=1}
    const result = await payload.find({
      collection: 'posts',
      draft,
      limit: 50,
      overrideAccess: draft,
      depth: 1,
      pagination: false,
      sort: '-publishedAt',
      select: {
        id: true,
        title: true,
        slug: true,
        categories: true,
        meta: true,
        content: true,
        publishedAt: true,
        createdAt: true,
      },
      where: {
        categories: { equals: categoryId },
      },
    })

    return result.docs || []
  },
)

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

const getCategoryIcon = (icon?: CategoryIcon | null) => iconMap[icon ?? 'folder'] ?? Folder

const buildBreadcrumbs = (
  breadcrumbs: { label?: string | null; url?: string | null }[],
  currentLabel: string,
) => {
  const items = breadcrumbs
    .filter((crumb) => crumb?.label && crumb?.url)
    .map((crumb) => ({
      label: crumb.label ?? 'Category',
      href: crumb.url ? `/categories${crumb.url}` : null,
    }))

  const hasCurrent = items.some(
    (item) => item.label.toLowerCase() === currentLabel.toLowerCase(),
  )

  if (!hasCurrent) {
    items.push({ label: currentLabel, href: null })
  } else {
    items[items.length - 1] = { ...items[items.length - 1], href: null }
  }

  return items
}

const queryRelatedCategories = async (category: {
  id: string
  parent?: string | { id?: string | null } | null
}) => {
  const parentId =
    typeof category.parent === 'string' ? category.parent : category.parent?.id ?? null

  if (!parentId) return []

  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 6,
    pagination: false,
    overrideAccess: false,
    select: {
      id: true,
      title: true,
      slug: true,
      icon: true,
      badge: true,
    },
    where: {
      and: [{ parent: { equals: parentId } }, { id: { not_equals: category.id } }],
    },
  })

  return result.docs ?? []
}

const getTextFromNode = (node: unknown): string => {
  if (!node) return ''
  if (Array.isArray(node)) return node.map(getTextFromNode).join(' ')
  if (typeof node === 'string') return node
  if (typeof node === 'object') {
    const record = node as { text?: string; children?: unknown[] }
    if (typeof record.text === 'string') return record.text
    if (Array.isArray(record.children)) return record.children.map(getTextFromNode).join(' ')
  }
  return ''
}

const getReadTime = (content: unknown): number | null => {
  const text = getTextFromNode((content as { root?: unknown })?.root ?? content)
  const words = text.trim().split(/\s+/).filter(Boolean).length
  if (!words) return null
  return Math.max(1, Math.round(words / 200))
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
