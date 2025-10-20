'use client'

import { useState } from 'react'
import { LogOut, Menu, X, Moon, Sun, Bell } from 'react-feather'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { SidebarItem } from '../../../components/sidebar-item'
import Logo from '../../../components/logo'
import { Button } from '@/components/ui/button'
import { useDarkMode } from '@/hooks/use-dark-mode'

// Shared styling for sidebar borders
const SIDEBAR_BORDER_CLASSES = 'border-t dark:border-slate-800'

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

export default function StudentSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isDark, toggleDarkMode, isMounted } = useDarkMode()

  const handleLogout = async () => {
    await signOut()
  }

  const handleNotifications = () => {
    router.push('/student/notifications')
    setIsMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between bg-white dark:bg-slate-950 border-b dark:border-slate-800 shadow-sm lg:hidden">
        <div className="flex items-center gap-3 px-4">
          <Logo />
        </div>
        <div className="flex items-center gap-2 mr-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-slate-950 shadow-lg transition-transform duration-300 ease-in-out lg:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="p-6 pt-20">
            <Logo />
          </div>
          <div className="flex w-full flex-col flex-1">
            {studentRoutes.map((route) => (
              <SidebarItem
                key={route.href}
                label={route.label}
                href={route.href}
                onClick={() => setIsMobileMenuOpen(false)}
              />
            ))}
          </div>
          <div className={`p-6 ${SIDEBAR_BORDER_CLASSES} space-y-2`}>
            <button
              onClick={handleNotifications}
              type="button"
              className="flex w-full items-center gap-x-2 rounded-md px-3 py-2 text-sm font-[500] text-slate-500 dark:text-slate-400 transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Bell size={18} />
              Notifications
            </button>
            {isMounted && (
              <button
                onClick={toggleDarkMode}
                type="button"
                className="flex w-full items-center gap-x-2 rounded-md px-3 py-2 text-sm font-[500] text-slate-500 dark:text-slate-400 transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
            )}
            <button
              onClick={handleLogout}
              type="button"
              className="flex w-full items-center gap-x-2 rounded-md px-3 py-2 text-sm font-[500] text-slate-500 dark:text-slate-400 transition-all hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400"
            >
              <LogOut size={18} className="text-slate-500 dark:text-slate-400" />
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar - Always visible on desktop */}
      <div className="fixed inset-y-0 z-50 hidden h-full w-56 flex-col overflow-y-auto border-r bg-white shadow-sm lg:flex dark:bg-slate-950 dark:border-slate-800">
        <div className="p-6">
          <Logo />
        </div>
        <div className="flex w-full flex-col flex-1">
          {studentRoutes.map((route) => (
            <SidebarItem key={route.href} label={route.label} href={route.href} />
          ))}
        </div>
        <div className={`p-6 ${SIDEBAR_BORDER_CLASSES} space-y-2`}>
          <button
            onClick={handleNotifications}
            type="button"
            className="flex w-full items-center gap-x-2 rounded-md px-3 py-2 text-sm font-[500] text-slate-500 dark:text-slate-400 transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Bell size={18} />
            Notifications
          </button>
          {isMounted && (
            <button
              onClick={toggleDarkMode}
              type="button"
              className="flex w-full items-center gap-x-2 rounded-md px-3 py-2 text-sm font-[500] text-slate-500 dark:text-slate-400 transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          )}
          <button
            onClick={handleLogout}
            type="button"
            className="flex w-full items-center gap-x-2 rounded-md px-3 py-2 text-sm font-[500] text-slate-500 dark:text-slate-400 transition-all hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400"
          >
            <LogOut size={18} className="text-slate-500 dark:text-slate-400" />
            Log Out
          </button>
        </div>
      </div>
    </>
  )
}
