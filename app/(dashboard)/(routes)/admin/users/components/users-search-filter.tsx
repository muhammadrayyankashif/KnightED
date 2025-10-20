'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface UsersSearchFilterProps {
  onSearchChange: (search: string) => void
  onRoleFilterChange: (role: string | null) => void
  searchValue: string
  selectedRole: string | null
}

export const UsersSearchFilter = ({ 
  onSearchChange, 
  onRoleFilterChange, 
  searchValue, 
  selectedRole 
}: UsersSearchFilterProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const roles = [
    { value: 'student', label: 'Student' },
    { value: 'teacher', label: 'Teacher' },
  ]

  const handleRoleSelect = (role: string | null) => {
    onRoleFilterChange(role)
    setIsFilterOpen(false)
  }

  return (
    <div className="flex items-center gap-4 mb-6">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search users by name or email..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Role Filter */}
      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter by Role
            {selectedRole && (
              <Badge variant="secondary" className="ml-1">
                {roles.find(r => r.value === selectedRole)?.label}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48" align="end">
          <div className="space-y-2">
            <div className="text-sm font-medium">Filter by Role</div>
            <div className="space-y-1">
              <Button
                variant={selectedRole === null ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
                onClick={() => handleRoleSelect(null)}
              >
                All Users
              </Button>
              {roles.map((role) => (
                <Button
                  key={role.value}
                  variant={selectedRole === role.value ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleRoleSelect(role.value)}
                >
                  {role.label}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {(searchValue || selectedRole) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onSearchChange('')
            onRoleFilterChange(null)
          }}
        >
          Clear
        </Button>
      )}
    </div>
  )
}
