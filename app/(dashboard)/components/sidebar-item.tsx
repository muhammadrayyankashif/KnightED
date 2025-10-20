'use client'

import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SidebarItemProps {
  label: string
  href: string
  onClick?: () => void
}

export const SidebarItem = ({ label, href, onClick: customOnClick }: SidebarItemProps) => {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (pathname === '/' && href === '/') || 
    pathname === href || 
    (href !== '/admin' && pathname.startsWith(`${href}/`))

  const onClick = () => {
    router.push(href)
    if (customOnClick) {
      customOnClick()
    }
  }

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        'flex items-center gap-x-2 pl-6 text-sm font-[500] text-slate-500 dark:text-slate-300 transition-all hover:bg-slate-300/20 dark:hover:bg-slate-800/50 hover:text-slate-600 dark:hover:text-slate-100',
        isActive && 'bg-gold/20 text-gray-700 dark:text-gold hover:bg-gold/20 dark:hover:bg-gold/10 hover:text-gray-700 dark:hover:text-gold',
      )}
    >
      <div className="flex items-center gap-x-2 py-4">
        {label}
      </div>
      <div
        className={cn('ml-auto h-full border-2 border-gold opacity-0 transition-all', isActive && 'opacity-100')}
      />
    </button>
  )
}
