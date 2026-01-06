import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'featured', 'sortOrder', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },

    {
      name: 'description',
      type: 'textarea',
      required: false,
      admin: {
        description:
          'Shown on /categories cards. Keep it 1–2 lines (e.g., “Write-ups focused on privilege escalation & post-exploitation.”)',
      },
    },

    {
      name: 'icon',
      type: 'select',
      required: false,
      defaultValue: 'folder',
      options: [
        { label: 'Folder', value: 'folder' },
        { label: 'Terminal', value: 'terminal' },
        { label: 'Shield', value: 'shield' },
        { label: 'Bug', value: 'bug' },
        { label: 'Network', value: 'network' },
        { label: 'Lock', value: 'lock' },
        { label: 'Binary', value: 'binary' },
        { label: 'Database', value: 'database' },
      ],
      admin: {
        description: 'Used for the icon on /categories.',
      },
    },

    {
      name: 'badge',
      type: 'text',
      required: false,
      admin: {
        description: 'Optional short badge text (e.g., “OSCP”, “HTB”, “AD”).',
      },
    },

    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Featured categories show at the top of /categories.',
      },
    },

    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 100,
      admin: {
        description:
          'Lower comes first. Use to manually order categories (e.g., Boot2Root=1, CTF=2...).',
        position: 'sidebar',
      },
    },

    // Keep your slug field
    slugField({
      position: undefined,
      // If you want the slug to sit in the sidebar, uncomment:
      // admin: { position: 'sidebar' },
    }),
  ],
}
