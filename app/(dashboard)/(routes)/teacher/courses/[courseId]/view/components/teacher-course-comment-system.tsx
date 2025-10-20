'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageSquare, Edit, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '@/components/auth/auth-provider'

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
}

interface CourseComment {
  _id: string
  content: string
  courseId: string
  userId: User | null
  createdAt: string | Date
  updatedAt: string | Date
}


interface TeacherCourseCommentSystemProps {
  courseId: string
}

export const TeacherCourseCommentSystem = ({ courseId }: TeacherCourseCommentSystemProps) => {
  const { user } = useAuth()
  const [courseComments, setCourseComments] = useState<CourseComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const fetchCourseComments = useCallback(async () => {
    try {
      const response = await axios.get(`/api/courses/${courseId}/comments`)
      setCourseComments(response.data)
    } catch (error) {
      // Failed to fetch course comments
    }
  }, [courseId])

  useEffect(() => {
    fetchCourseComments()
  }, [fetchCourseComments])

  const handleSubmitCourseComment = async () => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post(`/api/courses/${courseId}/comments`, {
        content: newComment,
      })
      
      setCourseComments([response.data, ...courseComments])
      setNewComment('')
      toast.success('Comment added successfully')
    } catch (error) {
      toast.error('Failed to add comment')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.put(`/api/courses/${courseId}/comments/${commentId}`, {
        content: editText,
      })
      
      setCourseComments(courseComments.map(comment => 
        comment._id === commentId 
          ? { ...comment, content: response.data.content, updatedAt: response.data.updatedAt }
          : comment
      ))
      
      setEditText('')
      setEditingComment(null)
      toast.success('Comment updated successfully')
    } catch (error) {
      toast.error('Failed to update comment')
    } finally {
      setIsLoading(false)
    }
  }

  const isCommentOwner = (commentUserId: string) => {
    return user?.userId === commentUserId
  }

  const isTeacher = () => {
    return user?.role === 'teacher' || user?.role === 'admin'
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUserName = (user: User | null) => {
    if (!user) return 'Unknown User'
    return `${user.firstName} ${user.lastName}`
  }

  const renderCourseComments = () => (
    <div className="space-y-4">
      {courseComments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm">No course comments yet.</p>
        </div>
      ) : (
        courseComments.map((comment) => (
          <Card key={comment._id} className="border dark:border-slate-700 bg-background dark:bg-slate-900">
            <CardContent className="p-4">
              {editingComment === comment._id ? (
                <div className="space-y-3">
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Edit your comment..."
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingComment(null)
                        setEditText('')
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleEditComment(comment._id)}
                      disabled={isLoading || !editText.trim()}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm text-foreground">
                        {getUserName(comment.userId)}
                      </span>
                      {isTeacher() && isCommentOwner(comment.userId?._id || '') && (
                        <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs">
                          Teacher
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.createdAt)}
                        {new Date(comment.updatedAt).getTime() !== new Date(comment.createdAt).getTime() && (
                          <span className="ml-1">(edited)</span>
                        )}
                      </span>
                    </div>
                    {isCommentOwner(comment.userId?._id || '') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingComment(comment._id)
                          setEditText(comment.content)
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-foreground" />
        <h3 className="text-xl font-semibold text-foreground">
          Course Comments ({courseComments.length})
        </h3>
      </div>

      {/* Add Comment Form */}
      <div className="bg-muted dark:bg-slate-800 p-4 rounded-lg">
        <div className="flex gap-3">
          <Input
            placeholder="Share your thoughts about this course as a teacher..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmitCourseComment()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSubmitCourseComment}
            disabled={isLoading || !newComment.trim()}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Your comments will appear with a &quot;Teacher&quot; badge
        </p>
      </div>

      {/* Comments */}
      {renderCourseComments()}
    </div>
  )
}
