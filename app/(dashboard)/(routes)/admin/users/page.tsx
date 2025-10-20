import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/teacher'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { AdminUsersClient } from './components/admin-users-client'

export default async function AdminUsersPage() {
  await connectDB()
  const user = await getCurrentUser()

  if (!user || !isAdmin(user)) {
    return redirect('/')
  }

  // Get all users except admins
  const users = await db.user.find({ role: { $ne: 'admin' } })
    .sort({ createdAt: -1 })

  // Convert Mongoose documents to plain objects
  const serializedUsers = users.map(user => ({
    _id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }))

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">All Users</h1>
        <p className="text-muted-foreground">
          Manage all users in KnightED (excluding admins)
        </p>
      </div>
      
      <AdminUsersClient users={serializedUsers} />
    </div>
  )
}
