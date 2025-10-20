'use client'

import { LogOut } from 'react-feather'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { SidebarItem } from '../../../components/sidebar-item'
import Logo from '../../../components/logo'

const adminRoutes = [
  {
    label: 'Admin Panel',
    href: '/admin',
  },
  {
    label: 'All Courses',
    href: '/admin/courses',
  },
  {
    label: 'Categories',
    href: '/admin/categories',
  },
  {
    label: 'Notes',
    href: '/admin/notes',
  },
  {
    label: 'Past Papers',
    href: '/admin/past-papers',
  },
  {
    label: 'Users',
    href: '/admin/users',
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto border-r bg-white shadow-sm">
      <div className="p-6">
        <Logo />
      </div>
      <div className="flex w-full flex-col flex-1">
        {adminRoutes.map((route) => (
          <SidebarItem key={route.href} label={route.label} href={route.href} />
        ))}
      </div>
      <div className="p-6 border-t">
        <button
          onClick={handleLogout}
          type="button"
          className="flex w-full items-center gap-x-2 rounded-md px-3 py-2 text-sm font-[500] text-slate-500 transition-all hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} className="text-slate-500" />
          Log Out
        </button>
      </div>
    </div>
  )
}
