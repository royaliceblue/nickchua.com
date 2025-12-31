import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })
  const postsPerCategory = 12

  const categories = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 100,
    overrideAccess: false,
    sort: 'title',
  })

  const categoriesWithPosts = await Promise.all(
    categories.docs.map(async (category) => {
      const posts = await payload.find({
        collection: 'posts',
        depth: 1,
        limit: postsPerCategory,
        overrideAccess: false,
        select: {
          title: true,
          slug: true,
          categories: true,
          meta: true,
        },
        where: {
          categories: {
            in: [category.id],
          },
        },
      })

      return {
        category,
        posts: posts.docs,
      }
    }),
  )

  const visibleCategories = categoriesWithPosts.filter(({ posts }) => posts.length > 0)

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Posts</h1>
        </div>
      </div>

      {visibleCategories.length > 0 ? (
        <div className="space-y-16">
          {visibleCategories.map(({ category, posts }) => (
            <section key={category.id}>
              <div className="container mb-8">
                <div className="prose dark:prose-invert max-w-none">
                  <h2>{category.title}</h2>
                </div>
              </div>
              <CollectionArchive posts={posts} />
            </section>
          ))}
        </div>
      ) : (
        <div className="container">No posts found.</div>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Payload Website Template Posts`,
  }
}
