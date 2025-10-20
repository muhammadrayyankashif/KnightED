import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { isStudent } from '@/lib/teacher'
import { StudentPastPapersClient } from './components/student-past-papers-client'

export default async function StudentPastPapersPage() {
  const user = await getCurrentUser()

  if (!user) {
    return redirect('/sign-in')
  }

  if (!isStudent(user)) {
    return redirect('/')
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-subheading dark:text-gray-50">Past Papers</h1>
        <p className="text-muted-foreground font-body dark:text-gray-400">
          Practice with past exam papers organized by subject and year
        </p>
      </div>
      
      <StudentPastPapersClient />
    </div>
  )
}
