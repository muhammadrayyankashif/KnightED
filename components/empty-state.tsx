'use client'

import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
        <Icon className="w-8 h-8 text-slate-600 dark:text-slate-300" />
      </div>

      <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-50">
        {title}
      </h3>

      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {description}
      </p>

      {action && (
        <Button
          asChild={!!action.href}
          onClick={action.onClick}
          variant="outline"
        >
          {action.href ? (
            <Link href={action.href}>
              {action.label}
            </Link>
          ) : (
            action.label
          )}
        </Button>
      )}
    </div>
  )
}
