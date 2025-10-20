import { NotificationPanel } from '@/components/notifications/notification-panel'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function TeacherNotificationsPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'teacher') {
    return redirect('/')
  }

  return <NotificationPanel />
}
