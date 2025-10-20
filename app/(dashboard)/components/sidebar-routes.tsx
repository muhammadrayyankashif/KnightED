'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { SidebarItem } from './sidebar-item'

const studentRoutes = [
  {
    label: 'Courses',
    href: '/student/search',
  },
  {
    label: 'Notes',
    href: '/student/notes',
  },
  {
    label: 'Past Papers',
    href: '/student/past-papers',
  },
]

const teacherRoutes = [
  {
    label: 'Courses',
    href: '/teacher/courses',
  },
]

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

export const SidebarRoutes = () => {
  const pathname = usePathname()
  const { user } = useAuth()

  const isTeacherPage = pathname?.startsWith('/teacher')
  const isAdminPage = pathname?.startsWith('/admin')

  let routes = studentRoutes

  if (user?.role === 'admin') {
    routes = adminRoutes
  } else if (user?.role === 'teacher') {
    routes = teacherRoutes
  } else if (user?.role === 'student') {
    routes = studentRoutes
  }

  return (
    <div className="flex w-full flex-col">
      {routes.map((route) => (
        <SidebarItem key={route.href} label={route.label} href={route.href} />
      ))}
    </div>
  )
}
