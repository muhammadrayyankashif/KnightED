'use client'

// Removed Prisma import - using MongoDB now
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { CourseActions } from './course-actions'

interface Course {
  _id: string
  title: string
  isPublished: boolean
  createdAt: Date
}

export const columns: ColumnDef<Course>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'isPublished',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Published
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const isPublished = row.getValue('isPublished') || false

      return (
        <div className="pl-8">
          <Badge className={cn('bg-slate-500', isPublished && 'bg-sky-700')}>{isPublished ? 'Published' : 'Draft'}</Badge>
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const { _id, title, isPublished } = row.original

      return <CourseActions courseId={_id} courseTitle={title} isPublished={isPublished} />
    },
  },
]
