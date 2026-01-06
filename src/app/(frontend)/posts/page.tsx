import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import PostsExplorer, {
  type PostsExplorerCategory,
  type PostsExplorerPost,
} from './posts-explorer.client'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
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
      description: true,
      icon: true,
      badge: true,
      featured: true,
      sortOrder: true,
    },
  })

  const postsRes = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 2000,
    pagination: false,
    overrideAccess: false,
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
  })

  const categoriesById = new Map<string, PostsExplorerCategory>()

  for (const category of categoriesRes.docs ?? []) {
    if (!category?.id) continue
    categoriesById.set(category.id, {
      id: category.id,
      title: category.title ?? category.slug ?? 'Untitled category',
      slug: category.slug,
      description: category.description ?? null,
      icon: category.icon ?? null,
      badge: category.badge ?? null,
      featured: Boolean(category.featured),
      sortOrder: typeof category.sortOrder === 'number' ? category.sortOrder : 100,
      count: 0,
      latestPostAt: 0,
      posts: [],
    })
  }

  for (const post of postsRes.docs ?? []) {
    const readTime = getReadTime(post?.content)
    const postDate = getPostDate(post?.publishedAt, post?.createdAt)

    const summary: PostsExplorerPost = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      categories: post.categories ?? [],
      meta: post.meta ?? undefined,
      publishedAt: post.publishedAt ?? null,
      createdAt: post.createdAt ?? null,
      readTime,
    }

    const categories = Array.isArray(post.categories) ? post.categories : []

    for (const category of categories) {
      const categoryId = typeof category === 'string' ? category : category?.id
      if (!categoryId) continue
      const entry = categoriesById.get(categoryId)
      if (!entry) continue

      entry.posts.push(summary)
      entry.count += 1
      if (postDate > entry.latestPostAt) entry.latestPostAt = postDate
    }
  }

  const categories = Array.from(categoriesById.values())
    .filter((category) => category.count > 0)
    .map((category) => ({
      ...category,
      posts: sortPostsByDate(category.posts),
    }))

  const totalPosts = postsRes.docs?.length ?? 0

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container">
        <PostsExplorer categories={categories} totalPosts={totalPosts} />
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Posts | Nick Chua - Security Engineer | OSCP+, OSWP, BSCP`,
  }
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

const getPostDate = (publishedAt?: string | null, createdAt?: string | null) => {
  const value = publishedAt ?? createdAt
  if (!value) return 0
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

const sortPostsByDate = (posts: PostsExplorerPost[]) => {
  return [...posts].sort((a, b) => {
    const aDate = getPostDate(a.publishedAt, a.createdAt)
    const bDate = getPostDate(b.publishedAt, b.createdAt)
    return bDate - aDate
  })
}
