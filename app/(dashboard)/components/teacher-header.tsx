'use client'

import { LogOut, ArrowLeft, Bell, Moon, Sun } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'
import { useDarkMode } from '@/hooks/use-dark-mode'
import { Button } from '@/components/ui/button'
import Logo from './logo'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const TeacherHeader = () => {
  const { signOut } = useAuth()
  const pathname = usePathname()
  const { isDark, toggleDarkMode, isMounted } = useDarkMode()

  const handleLogout = async () => {
    await signOut()
  }

  const isNotificationsPage = pathname?.startsWith('/teacher/notifications')

  return (
    <div className="fixed inset-y-0 z-50 h-[80px] w-full bg-white border-b shadow-sm dark:bg-slate-900 dark:border-slate-800">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        {/* Left side - Logo or Back button */}
        <div className="flex items-center gap-3">
          {isNotificationsPage ? (
            <Link href="/teacher/courses">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-x-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Courses</span>
              </Button>
            </Link>
          ) : (
            <Logo />
          )}
        </div>

        {/* Right side - Notification, Dark Mode, and Logout buttons */}
        <div className="flex items-center gap-x-2">
          {!isNotificationsPage && (
            <>
              {/* Mobile: Bell icon */}
              <Link href="/teacher/notifications" className="lg:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-x-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950"
                >
                  <Bell className="h-5 w-5" />
                </Button>
              </Link>

              {/* Desktop: Notifications link */}
              <Link href="/teacher/notifications" className="hidden lg:block">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-x-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950"
                >
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </Button>
              </Link>
            </>
          )}

          {/* Dark Mode Toggle */}
          {isMounted && (
            <Button
              onClick={toggleDarkMode}
              variant="ghost"
              size="sm"
              className="flex items-center gap-x-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="hidden sm:inline">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </Button>
          )}

          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="flex items-center gap-x-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log Out</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
