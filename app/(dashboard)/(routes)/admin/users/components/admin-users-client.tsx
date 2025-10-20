'use client'

import { useState } from 'react'
import { AdminUsersTable } from './admin-users-table'
import { UsersSearchFilter } from './users-search-filter'

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  createdAt: string
}

interface AdminUsersClientProps {
  users: User[]
}

export const AdminUsersClient = ({ users }: AdminUsersClientProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string | null>(null)

  return (
    <div>
      <UsersSearchFilter
        onSearchChange={setSearchTerm}
        onRoleFilterChange={setRoleFilter}
        searchValue={searchTerm}
        selectedRole={roleFilter}
      />
      
      <AdminUsersTable
        users={users}
        searchTerm={searchTerm}
        roleFilter={roleFilter}
      />
    </div>
  )
}
