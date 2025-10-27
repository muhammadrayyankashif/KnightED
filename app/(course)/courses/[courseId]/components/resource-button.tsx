'use client'

import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ResourceButtonProps {
  courseId: string
  attachmentId: string
  filename: string
  url: string
  fileExtension?: string
  className?: string
}

export const ResourceButton = ({ courseId, attachmentId, filename, url, fileExtension = '', className }: ResourceButtonProps) => {
  // Handle view - check if it has a file extension
  const handleView = () => {
    if (!fileExtension) {
      // No file extension = URL, open directly
      window.open(url, '_blank')
    } else {
      // Has file extension = uploaded file, use API endpoint
      window.open(`/api/courses/${courseId}/attachments/${attachmentId}/view`, '_blank')
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleView}
      className={className}
    >
      <ExternalLink className="h-4 w-4 mr-2" />
      View
    </Button>
  )
}
