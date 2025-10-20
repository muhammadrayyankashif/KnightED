'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { Navbar } from './navbar'
import Sidebar from './sidebar'
import { TeacherHeader } from './teacher-header'
import AdminSidebar from '../(routes)/admin/components/admin-sidebar'
import StudentSidebar from '../(routes)/student/components/student-sidebar'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export const ConditionalLayout = ({ children }: ConditionalLayoutProps) => {
  const pathname = usePathname()
  const { user } = useAuth()
  const isAdminRoute = pathname?.startsWith('/admin')
  const isTeacherRoute = pathname?.startsWith('/teacher')

  if (isAdminRoute) {
    return (
      <div className="h-full">
        <div className="fixed inset-y-0 z-50 hidden h-full w-56 flex-col md:flex">
          <AdminSidebar />
        </div>
        <main className="h-full md:pl-56">{children}</main>
      </div>
    )
  }

  if (isTeacherRoute) {
    const isChapterPage = pathname?.includes('/chapters/')
    return (
      <div className="h-full bg-white dark:bg-slate-950">
        {!isChapterPage && <TeacherHeader />}
        <main className={`h-full ${!isChapterPage ? 'pt-[80px]' : ''} bg-white dark:bg-slate-950`}>{children}</main>
      </div>
    )
  }

  if (pathname?.startsWith('/student') || user?.role === 'student') {
    return (
      <div className="h-full bg-white dark:bg-slate-950">
        <StudentSidebar />
        <main className="h-full pt-16 lg:pt-0 lg:pl-56 bg-white dark:bg-slate-950">{children}</main>
      </div>
    )
  }

  return (
    <div className="h-full">
      <div className="fixed inset-y-0 z-50 h-[80px] w-full md:pl-56">
        <Navbar />
      </div>
      <div className="fixed inset-y-0 z-50 hidden h-full w-56 flex-col md:flex">
        <Sidebar />
      </div>
      <main className="h-full pt-[80px] md:pl-56">{children}</main>
    </div>
  )
}
