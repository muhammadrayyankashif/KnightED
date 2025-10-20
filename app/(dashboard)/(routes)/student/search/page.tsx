import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { isStudent } from '@/lib/teacher'
import { SearchContent } from './components/search-content'

export const dynamic = 'force-dynamic'

const StudentSearchPage = async () => {
  const user = await getCurrentUser()

  if (!user) {
    return redirect('/sign-in')
  }

  if (!isStudent(user)) {
    return redirect('/')
  }

  return <SearchContent userId={user.userId.toString()} />
}

export default StudentSearchPage
