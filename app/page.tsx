import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import HomePage from './components/home-page'

export default async function Page() {
  const user = await getCurrentUser()

  if (!user) {
    return <HomePage />
  }

  switch (user.role) {
    case 'admin':
      redirect('/admin')
    case 'teacher':
      redirect('/teacher/courses')
    case 'student':
    default:
      redirect('/student/search')
  }
}