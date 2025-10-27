'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Reply, Edit, Send } from 'lucide-react'
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

interface Comment {
  _id: string
  content: string
  videoIndex: number
  chapterId: string
  courseId: string
  userId: User
  parentCommentId?: string
  createdAt: string | Date
  updatedAt: string | Date
  replies?: Comment[]
}

interface VideoCommentSystemProps {
  chapterId: string
  courseId: string
  videoIndex: number
}

export const VideoCommentSystem = ({ chapterId, courseId, videoIndex }: VideoCommentSystemProps) => {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(true)

  useEffect(() => {
    let isMounted = true
    const abortController = new AbortController()

    const fetchComments = async () => {
      try {
        setIsLoadingComments(true)
        const response = await axios.get(`/api/courses/${courseId}/chapters/${chapterId}/comments?videoIndex=${videoIndex}`, {
          signal: abortController.signal,
        })

        // Only update state if component is still mounted
        if (isMounted) {
          setComments(response.data || [])
          setIsLoadingComments(false)
        }
      } catch (error) {
        // Only log error if it's not an abort error
        if (!axios.isCancel(error)) {
          // eslint-disable-next-line no-console
          console.error('Error fetching comments:', error)
          if (isMounted) {
            setComments([])
            setIsLoadingComments(false)
          }
        }
      }
    }

    fetchComments()

    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [courseId, chapterId, videoIndex])

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post(`/api/courses/${courseId}/chapters/${chapterId}/comments`, {
        content: newComment,
        videoIndex,
      })
      
      setComments([response.data, ...comments])
      setNewComment('')
      toast.success('Comment added successfully')
    } catch (error) {
      toast.error('Failed to add comment')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReply = async (parentCommentId: string) => {
    if (!replyText.trim()) {
      toast.error('Reply cannot be empty')
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post(`/api/courses/${courseId}/chapters/${chapterId}/comments`, {
        content: replyText,
        videoIndex,
        parentCommentId,
      })
      
      // Update the parent comment with the new reply
      setComments(comments.map(comment => 
        comment._id === parentCommentId 
          ? { ...comment, replies: [...(comment.replies || []), response.data] }
          : comment
      ))
      
      setReplyText('')
      setReplyingTo(null)
      toast.success('Reply added successfully')
    } catch (error) {
      toast.error('Failed to add reply')
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
      const response = await axios.put(`/api/courses/${courseId}/chapters/${chapterId}/comments/${commentId}`, {
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Add Comment Form */}
      <div className="mb-4 md:mb-6">
        <div className="flex gap-2 md:gap-3">
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
            disabled={isLoading}
            className="flex-1 text-sm md:text-base dark:bg-slate-700 dark:text-gray-50 dark:placeholder:text-gray-400 dark:border-slate-600"
          />
          <Button
            onClick={handleSubmitComment}
            disabled={isLoading || !newComment.trim()}
            size="sm"
            className="px-3 md:px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {isLoadingComments ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 dark:border-gray-600 mx-auto mb-3" />
            <p className="text-sm">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm">No comments yet.</p>
            <p className="text-xs mt-1">Be the first to comment on this video!</p>
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
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {getUserName(comment.userId)}
                        </span>
                        {comment.userId && isUserTeacher(comment.userId) && (
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
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{comment.content}</p>

                    {/* Reply Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(comment._id)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-0 h-auto"
                    >
                      <Reply className="h-3 w-3 mr-1" />
                      Reply
                    </Button>

                    {/* Reply Form */}
                    {replyingTo === comment._id && (
                      <div className="mt-3 pl-4 border-l-2 border-gray-200 dark:border-slate-700">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Write a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleReply(comment._id)}
                            disabled={isLoading}
                            className="flex-1 dark:bg-slate-700 dark:text-gray-50 dark:placeholder:text-gray-400 dark:border-slate-600"
                          />
                          <Button
                            onClick={() => handleReply(comment._id)}
                            disabled={isLoading || !replyText.trim()}
                            size="sm"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setReplyingTo(null)
                            setReplyText('')
                          }}
                          className="mt-2 p-0 h-auto text-gray-500 dark:text-gray-400"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 pl-4 border-l-2 border-gray-200 dark:border-slate-700 space-y-3">
                        {comment.replies.map((reply) => (
                          <div key={reply._id} className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                  {getUserName(reply.userId)}
                                </span>
                                {reply.userId && isUserTeacher(reply.userId) && (
                                  <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs">
                                    Teacher
                                  </Badge>
                                )}
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDate(reply.createdAt)}
                                  {new Date(reply.updatedAt).getTime() !== new Date(reply.createdAt).getTime() && (
                                    <span className="ml-1">(edited)</span>
                                  )}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
