import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  return (
    <div className={clsx('h-[34px] w-full max-w-[9.375rem]', className)}>
      <img
        alt="Nick Chua Logo"
        width={150}
        height={34}
        loading={loading}
        fetchPriority={priority}
        decoding="async"
        className="h-[34px] w-auto dark:hidden"
        src="/logo-nick-light.svg"
      />
      <img
        alt="Nick Chua Logo"
        width={150}
        height={34}
        loading={loading}
        fetchPriority={priority}
        decoding="async"
        className="hidden h-[34px] w-auto dark:block"
        src="/logo-nick-dark.svg"
      />
    </div>
  )
}
