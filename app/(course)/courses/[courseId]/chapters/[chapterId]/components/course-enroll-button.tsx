'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { Button } from '@/components/ui/button'
type CourseEnrollButtonProps = {
  courseId: string
}

export default function CourseEnrollButton({ courseId }: CourseEnrollButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const onClick = async () => {
    try {
      setIsLoading(true)
      await axios.post(`/api/courses/${courseId}/enroll`)
      toast.success('Successfully enrolled in course!')
      window.location.reload()
    } catch {
      toast.error('Something went wrong!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button className="w-full md:w-auto" size="sm" onClick={onClick} disabled={isLoading}>
      {isLoading ? 'Enrolling...' : 'Enroll for Free'}
    </Button>
  )
}
