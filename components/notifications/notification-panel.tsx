'use client'

import { useNotifications, Notification } from '@/hooks/use-notifications'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Trash2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export const NotificationPanel = () => {
  const { notifications, markAsRead, deleteNotification, isLoading } = useNotifications()
  // Filter only comment_reply notifications (for teachers)
  const teacherNotifications = notifications.filter((n) => n.type === 'comment_reply')

  const getVideoLink = (notification: Notification) => {
    if (notification.chapterId) {
      return `/teacher/courses/${notification.courseId}/chapters/${notification.chapterId}?videoIndex=${notification.videoIndex || 0}`
    }
    return `/teacher/courses/${notification.courseId}/view`
  }

  const handleViewComment = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification._id)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Notifications</h2>
        <div className="text-muted-foreground">Loading notifications...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">
          Manage comments and replies from your courses
        </p>
      </div>

      {teacherNotifications.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <p>No notifications yet</p>
          <p className="text-sm mt-2">Comments from students will appear here</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {teacherNotifications.map((notification) => (
            <Card
              key={notification._id}
              className={cn(
                'p-4 space-y-4',
                !notification.read && 'border-blue-500 bg-blue-50 dark:bg-slate-800'
              )}
            >
              {/* Header with User Info */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-sm">
                      {notification.comment?.userId
                        ? `${notification.comment.userId.firstName} ${notification.comment.userId.lastName}`
                        : 'Unknown User'}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                      {new Date(notification.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{notification.content}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 flex-shrink-0"
                  onClick={() => deleteNotification(notification._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Comment Content */}
              {notification.comment && (
                <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-md border border-slate-200 dark:border-slate-600">
                  <p className="text-sm break-words text-gray-900 dark:text-gray-100">
                    {notification.comment.content}
                  </p>
                </div>
              )}

              {/* Course & Video Info */}
              {notification.course && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    <strong>Course:</strong> {notification.course.title}
                  </p>
                  {notification.chapter && (
                    <p>
                      <strong>Chapter:</strong> {notification.chapter.title}
                    </p>
                  )}
                  {notification.videoTitle && (
                    <p>
                      <strong>Video:</strong> {notification.videoTitle}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <Link href={getVideoLink(notification)}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleViewComment(notification)}
                >
                  View Comment in Course
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
