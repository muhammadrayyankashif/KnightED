'use client'

import { useNotifications, Notification } from '@/hooks/use-notifications'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Bell } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function StudentNotificationsPage() {
  const { notifications, markAsRead, deleteNotification, isLoading } = useNotifications()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications

  const getNotificationLink = (notification: Notification) => {
    if (notification.type === 'comment_reply' && notification.chapterId) {
      return `/courses/${notification.courseId}/chapters/${notification.chapterId}?videoIndex=${notification.videoIndex || 0}`
    }
    if (notification.courseId) {
      return `/courses/${notification.courseId}`
    }
    return '#'
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification._id)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">
          Stay updated with course activity and replies
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All {notifications.length > 0 && `(${notifications.length})`}
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          onClick={() => setFilter('unread')}
        >
          Unread {filteredNotifications.filter(n => !n.read).length > 0 && `(${filteredNotifications.filter(n => !n.read).length})`}
        </Button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Loading notifications...
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No notifications</p>
          <p className="text-sm mt-2">
            {filter === 'unread'
              ? "You're all caught up! Check back later for new updates."
              : "You don't have any notifications yet. Stay tuned for course updates and replies!"}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Link
              key={notification._id}
              href={getNotificationLink(notification)}
            >
              <Card
                className={cn(
                  'p-4 cursor-pointer transition-all hover:shadow-md hover:border-blue-300',
                  !notification.read && 'border-blue-500 bg-blue-50 dark:bg-slate-800'
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{notification.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                        {new Date(notification.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        deleteNotification(notification._id)
                      }}
                      title="Delete notification"
                      aria-label="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Comment Preview */}
                  {notification.comment && (
                    <Card className="p-3 bg-slate-50 dark:bg-slate-700 border text-sm break-words">
                      {notification.comment.content}
                    </Card>
                  )}

                  {/* Course & Chapter Info */}
                  {notification.course && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>
                        <strong>Course:</strong> {notification.course.title}
                      </p>
                      {notification.chapter && (
                        <p>
                          <strong>Chapter:</strong> {notification.chapter.title}
                          {notification.videoIndex !== undefined && ` (Video ${notification.videoIndex + 1})`}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Unread Indicator */}
                  {!notification.read && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-blue-600 dark:text-blue-400">Unread</span>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
