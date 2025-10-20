'use client'

import { Bell } from 'lucide-react'
import { useNotifications } from '@/hooks/use-notifications'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface NotificationBellProps {
  onClick?: () => void
}

export const NotificationBell = ({ onClick }: NotificationBellProps) => {
  const { unreadCount } = useNotifications()

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        className="relative flex items-center gap-2"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 hover:bg-red-600"
            variant="destructive"
          >
            <span className="text-xs font-bold">{unreadCount > 99 ? '99+' : unreadCount}</span>
          </Badge>
        )}
      </Button>
    </div>
  )
}
