import CourseMobileSidebar from './course-mobile-sidebar'
import { NavbarRoutes } from '@/components/navbar-routes'

type CourseNavbarProps = {
  course: any // Course with populated chapters and userProgress
  progressCount: number
}

export default function CourseNavbar({ course, progressCount }: CourseNavbarProps) {
  return (
    <div className="flex h-full items-center border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <CourseMobileSidebar course={course} progressCount={progressCount} />
      <NavbarRoutes />
    </div>
  )
}
