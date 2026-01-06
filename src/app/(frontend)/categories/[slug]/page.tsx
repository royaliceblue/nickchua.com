import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import React, { cache } from 'react'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })

  const categories = await payload.find({
    collection: 'categories',
    draft: false,
    limit: 1000,
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

  return (
    <main className="pt-16 pb-24">
      <div className="container space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">{category.title ?? category.title ?? decodedSlug}</h1>

          {/* If your category has breadcrumbs, transform them to /categories/... */}
          {Array.isArray(category.breadcrumbs) && category.breadcrumbs.length > 0 ? (
            <nav className="text-sm text-muted-foreground">
              {category.breadcrumbs.map((b: any, i: number) => {
                const href = b?.url ? `/categories${b.url}` : '#'
                return (
                  <span key={`${href}-${i}`}>
                    <a className="underline" href={href}>
                      {b.label}
                    </a>
                    {i < category.breadcrumbs.length - 1 ? ' / ' : ''}
                  </span>
                )
              })}
            </nav>
          ) : null}
        </header>

        <section className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-muted-foreground">No posts yet.</p>
          ) : (
            posts.map((p: any) => (
              <article key={p.id} className="rounded-lg border p-4">
                <a className="text-lg font-semibold underline" href={`/posts/${p.slug}`}>
                  {p.title}
                </a>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const category = await queryCategoryBySlug({ slug: decodedSlug })

  if (!category) return { title: 'Category not found' }
  const title = category.title ?? category.title ?? decodedSlug

  return {
    title: `${title} | Categories`,
  }
}

const queryCategoryBySlug = cache(async ({ slug }: { slug: string }) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'categories',
    limit: 1,
    pagination: false,
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
      pagination: false,
      sort: '-publishedAt',
      where: {
        categories: { equals: categoryId },
      },
    })

    return result.docs || []
  },
)
