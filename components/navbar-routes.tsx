'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { UserButton } from '@/components/auth/user-button'
import { usePathname } from 'next/navigation'
import { LogOut } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { isTeacher, isAdmin } from '@/lib/teacher'

export const NavbarRoutes = () => {
  const { user } = useAuth()

  const pathname = usePathname()

  const isTeacherPage = pathname?.startsWith('/teacher')
  const isAdminPage = pathname?.startsWith('/admin')
  const isStudentPage = pathname?.startsWith('/student')
  const isCoursePage = pathname?.includes('/courses')
  const isSearchPage = pathname?.includes('/search')

  return (
    <>
      <div className="ml-auto flex gap-x-2">
        <UserButton />
      </div>
    </>
  )
}
