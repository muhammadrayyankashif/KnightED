'use client'

import { useNotifications, Notification } from '@/hooks/use-notifications'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, ArrowRight, Trash2 } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export const NotificationCenter = ({ isOpen, onClose }: NotificationCenterProps) => {
  const { notifications, markAsRead, deleteNotification, isLoading } = useNotifications()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications

  const getNotificationLink = (notification: Notification) => {
    if (notification.type === 'comment_reply' && notification.chapterId) {
      // For video comments, link to the video
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

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-30"
        onClick={onClose}
      />

      {/* Notification Panel */}
      <div className="fixed right-0 top-0 z-50 h-screen w-full max-w-md bg-white dark:bg-slate-900 shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b dark:border-slate-700 p-4">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b dark:border-slate-700 p-4">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
            className="flex-1"
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('unread')}
            className="flex-1"
          >
            Unread
          </Button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Loading notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
              <p>No notifications</p>
              {filter === 'unread' && (
                <p className="text-xs">You&apos;re all caught up!</p>
              )}
            </div>
          ) : (
            <div className="divide-y dark:divide-slate-700">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification._id}
                  className={cn(
                    'm-0 rounded-none border-0 border-b dark:border-slate-700 p-4 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800',
                    !notification.read && 'bg-blue-50 dark:bg-slate-800'
                  )}
                >
                  <div className="space-y-2">
                    {/* Content */}
                    <div className="pr-8">
                      <p className="text-sm font-medium">{notification.content}</p>
                      {notification.comment && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {notification.comment.content}
                        </p>
                      )}
                      {notification.course && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Course: {notification.course.title}
                        </p>
                      )}
                      {notification.chapter && (
                        <p className="text-xs text-muted-foreground">
                          Chapter: {notification.chapter.title}
                        </p>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link href={getNotificationLink(notification)} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-8 text-xs"
                          onClick={() => {
                            handleNotificationClick(notification)
                            onClose()
                          }}
                        >
                          <ArrowRight className="h-3 w-3 mr-1" />
                          Go
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={(e) => {
                          e.preventDefault()
                          deleteNotification(notification._id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
