'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Trash2, Star, StarOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Course {
  _id: string
  title: string
  description?: string
  isPublished: boolean
  isFeatured?: boolean
  createdAt: string
  createdById: {
    firstName: string
    lastName: string
    email: string
  } | null
}

interface AdminCoursesTableProps {
  courses: Course[]
}

export const AdminCoursesTable = ({ courses }: AdminCoursesTableProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingFeatured, setTogglingFeatured] = useState<string | null>(null)
  const router = useRouter()

  const onDelete = async (courseId: string) => {
    try {
      setDeletingId(courseId)
      await axios.delete(`/api/admin/courses/${courseId}`)
      toast.success('Course deleted successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete course')
    } finally {
      setDeletingId(null)
    }
  }

  const onToggleFeatured = async (courseId: string, currentFeatured: boolean) => {
    try {
      setTogglingFeatured(courseId)
      await axios.put(`/api/admin/courses/${courseId}/feature`, {
        isFeatured: !currentFeatured
      })
      toast.success(`Course ${!currentFeatured ? 'featured' : 'unfeatured'} successfully`)
      router.refresh()
    } catch (error) {
      toast.error('Failed to update course featured status')
    } finally {
      setTogglingFeatured(null)
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Creator</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No courses found
              </TableCell>
            </TableRow>
          ) : (
            courses.map((course) => (
              <TableRow key={course._id}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{course.title}</div>
                    {course.description && (
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {course.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {course.createdById ? (
                    <div>
                      <div className="font-medium">
                        {course.createdById.firstName} {course.createdById.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {course.createdById.email}
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">Unknown</div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={course.isFeatured === true ? 'default' : 'outline'}>
                    {course.isFeatured === true ? 'Featured' : 'Regular'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(course.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleFeatured(course._id, course.isFeatured === true)}
                      disabled={togglingFeatured === course._id}
                      title={course.isFeatured === true ? 'Remove from featured' : 'Add to featured'}
                    >
                      {togglingFeatured === course._id ? (
                        '...'
                      ) : course.isFeatured === true ? (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deletingId === course._id}
                        >
                          {deletingId === course._id ? (
                            'Deleting...'
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the course
                            &quot;{course.title}&quot; and all its associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(course._id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Course
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
