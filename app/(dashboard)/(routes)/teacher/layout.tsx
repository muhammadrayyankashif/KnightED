import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { isTeacher } from '@/lib/teacher'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!isTeacher(user)) {
    return redirect('/')
  }

  return <>{children}</>
}
