'use client'

import { useState } from 'react'
import { Star, StarOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import axios from 'axios'

interface FeaturedButtonProps {
  courseId: string
  isFeatured: boolean
}

export const FeaturedButton = ({ courseId, isFeatured }: FeaturedButtonProps) => {
  const [loading, setLoading] = useState(false)

  const handleToggleFeatured = async () => {
    try {
      setLoading(true)
      await axios.put(`/api/admin/courses/${courseId}/feature`, {
        isFeatured: !isFeatured
      })
      toast.success(`Course ${!isFeatured ? 'featured' : 'unfeatured'} successfully`)
      window.location.reload()
    } catch (error) {
      toast.error('Failed to update course featured status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className={`w-full ${isFeatured ? 'border-yellow-200 text-yellow-600 hover:bg-yellow-50' : ''}`}
      size="lg"
      onClick={handleToggleFeatured}
      disabled={loading}
    >
      {loading ? (
        'Updating...'
      ) : isFeatured ? (
        <>
          <Star className="h-4 w-4 mr-2 fill-current" />
          Featured
        </>
      ) : (
        <>
          <StarOff className="h-4 w-4 mr-2" />
          Feature Course
        </>
      )}
    </Button>
  )
}
