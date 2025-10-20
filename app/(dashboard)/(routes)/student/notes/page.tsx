import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { isStudent } from '@/lib/teacher'
import { StudentNotesClient } from './components/student-notes-client'

export default async function StudentNotesPage() {
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
        <h1 className="text-4xl font-subheading dark:text-gray-50">Study Notes</h1>
        <p className="text-muted-foreground font-body dark:text-gray-400">
          Access your notes organized by subject
        </p>
      </div>
      
      <StudentNotesClient />
    </div>
  )
}
