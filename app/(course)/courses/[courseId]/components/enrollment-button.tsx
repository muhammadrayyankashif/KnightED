'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'

interface EnrollmentButtonProps {
  courseId: string
  firstChapterId: string
  isEnrolled: boolean
}

export const EnrollmentButton = ({ courseId, firstChapterId, isEnrolled }: EnrollmentButtonProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleEnroll = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        credentials: 'include',
      })
      
      if (response.ok) {
        toast.success('Successfully enrolled!')
        window.location.reload()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to enroll')
      }
    } catch (error) {
      toast.error('Failed to enroll')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEnrolled) {
    return (
      <Link href={`/courses/${courseId}/chapters/${firstChapterId}`} className="w-full">
        <Button className="w-full" size="lg">
          <Play className="h-4 w-4 mr-2" />
          Start Learning
        </Button>
      </Link>
    )
  }

  return (
    <Button 
      className="w-full" 
      size="lg"
      onClick={handleEnroll}
      disabled={isLoading}
    >
      {isLoading ? 'Enrolling...' : 'Enroll for Free'}
    </Button>
  )
}
