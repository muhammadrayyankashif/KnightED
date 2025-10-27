'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DownloadButtonProps {
  url: string
  filename: string
  className?: string
}

export const DownloadButton = ({ url, filename, className }: DownloadButtonProps) => {
  const handleDownload = async () => {
    try {
      // Fetch the file from Cloudinary
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch file')
      
      // Get the file blob
      const blob = await response.blob()
      
      // Create a download link
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      // Fallback: open in new tab
      window.open(url, '_blank')
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleDownload}
      className={className}
    >
      <Download className="h-4 w-4 mr-2" />
      Download
    </Button>
  )
}
