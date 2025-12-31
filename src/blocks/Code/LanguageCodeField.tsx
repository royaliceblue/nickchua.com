'use client'
import React from 'react'
import { CodeField, useFormFields } from '@payloadcms/ui'
import type { CodeFieldClientComponent } from 'payload'

const monacoLanguageMap: Record<string, string> = {
  bash: 'shell',
  css: 'css',
  javascript: 'javascript',
  js: 'javascript',
  python: 'python',
  sh: 'shell',
  shell: 'shell',
  ts: 'typescript',
  tsx: 'typescript',
  typescript: 'typescript',
}

const buildLanguagePath = (path?: string) => {
  if (!path) return 'language'
  const segments = path.split('.')
  segments[segments.length - 1] = 'language'
  return segments.join('.')
}

const resolveLanguage = (language: unknown) => {
  if (typeof language !== 'string') return undefined
  const trimmed = language.trim()
  if (!trimmed) return undefined
  return monacoLanguageMap[trimmed] || trimmed
}

const LanguageCodeField: CodeFieldClientComponent = (props) => {
  const languagePath = buildLanguagePath(props.path)
  const languageValue = useFormFields(([fields]) => fields[languagePath]?.value)
  const fallbackLanguage = resolveLanguage(props.field?.admin?.language) ?? 'plaintext'
  const resolvedLanguage = resolveLanguage(languageValue) ?? fallbackLanguage

  return (
    <CodeField
      {...props}
      field={{
        ...props.field,
        admin: {
          ...props.field.admin,
          language: resolvedLanguage,
        },
      }}
    />
  )
}

export default LanguageCodeField
