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
  role: string
}

interface CourseComment {
  _id: string
  content: string
  courseId: string
  userId: User | null
  createdAt: string | Date
  updatedAt: string | Date
}

interface CourseCommentSystemProps {
  courseId: string
}

export const CourseCommentSystem = ({ courseId }: CourseCommentSystemProps) => {
  const { user } = useAuth()
  const [comments, setComments] = useState<CourseComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(true)
  const [isUserEnrolled, setIsUserEnrolled] = useState<boolean | null>(null)

  const fetchComments = useCallback(async () => {
    try {
      setIsLoadingComments(true)
      const response = await axios.get(`/api/courses/${courseId}/comments`)
      setComments(response.data)
    } catch (error) {
      // Failed to fetch course comments
    } finally {
      setIsLoadingComments(false)
    }
  }, [courseId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post(`/api/courses/${courseId}/comments`, {
        content: newComment,
      })

      setComments([response.data, ...comments])
      setNewComment('')
      setIsUserEnrolled(true)
      toast.success('Comment added successfully')
    } catch (error: any) {
      if (error.response?.status === 403) {
        setIsUserEnrolled(false)
        toast.error('You must be enrolled in this course to comment')
      } else {
        toast.error('Failed to add comment')
      }
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
      
      // Update the comment in the list
      setComments(comments.map(comment => 
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

  const isCommentOwner = (commentUserId: string | null | undefined) => {
    if (!commentUserId) return false
    return user?.userId === commentUserId
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

  const isUserTeacher = (user: User | null) => {
    return user?.role === 'teacher' || user?.role === 'admin'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
          Course Comments ({comments.length})
        </h3>
      </div>

      {/* Add Comment Form */}
      {isUserEnrolled !== false && (
        <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
          <div className="flex gap-3">
            <Input
              placeholder="Share your thoughts about this course..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
              disabled={isLoading}
              className="flex-1 dark:bg-slate-700 dark:text-gray-50 dark:placeholder:text-gray-400 dark:border-slate-600"
            />
            <Button
              onClick={handleSubmitComment}
              disabled={isLoading || !newComment.trim()}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Only enrolled students can comment on this course
          </p>
        </div>
      )}

      {/* Non-Enrolled Message */}
      {isUserEnrolled === false && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            <strong>Enroll to comment:</strong> To share your thoughts and engage with other students, please enroll in this course first.
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {isLoadingComments ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 dark:border-gray-600 mx-auto mb-3" />
            <p className="text-sm">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm">No comments yet.</p>
            <p className="text-xs mt-1">Be the first to share your thoughts about this course!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <Card key={comment._id} className="border border-gray-200 dark:border-slate-700 dark:bg-slate-900">
              <CardContent className="p-4">
                {editingComment === comment._id ? (
                  <div className="space-y-3">
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      placeholder="Edit your comment..."
                      className="dark:bg-slate-700 dark:text-gray-50 dark:placeholder:text-gray-400 dark:border-slate-600"
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
                        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {getUserName(comment.userId)}
                        </span>
                        {isUserTeacher(comment.userId) && (
                          <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs">
                            Teacher
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(comment.createdAt)}
                          {new Date(comment.updatedAt).getTime() !== new Date(comment.createdAt).getTime() && (
                            <span className="ml-1">(edited)</span>
                          )}
                        </span>
                      </div>
                      {comment.userId && isCommentOwner(comment.userId._id) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingComment(comment._id)
                            setEditText(comment.content)
                          }}
                          className="h-6 w-6 p-0 dark:text-gray-400 dark:hover:bg-slate-800"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{comment.content}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
