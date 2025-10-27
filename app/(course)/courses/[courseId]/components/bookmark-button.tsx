'use client'

import { useState, useEffect } from 'react'
import { Heart, HeartOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import axios from 'axios'

interface BookmarkButtonProps {
  courseId: string
}

export const BookmarkButton = ({ courseId }: BookmarkButtonProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      try {
        const response = await axios.get(`/api/bookmarks/${courseId}`)
        setIsBookmarked(response.data.isBookmarked)
      } catch (error) {
        // Failed to check bookmark status
      } finally {
        setChecking(false)
      }
    }

    checkBookmarkStatus()
  }, [courseId])

  const handleToggleBookmark = async () => {
    try {
      setLoading(true)
      
      if (isBookmarked) {
        // Remove bookmark
        await axios.delete(`/api/bookmarks/${courseId}`)
        setIsBookmarked(false)
        toast.success('Removed from favorites')
      } else {
        // Add bookmark
        await axios.post('/api/bookmarks', { courseId })
        setIsBookmarked(true)
        toast.success('Added to favorites')
      }
    } catch (error) {
      toast.error('Failed to update bookmark')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <Button variant="outline" className="w-full" size="lg" disabled>
        <Heart className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      className={`w-full ${isBookmarked ? 'border-red-200 text-red-600 hover:bg-red-50' : ''}`}
      size="lg"
      onClick={handleToggleBookmark}
      disabled={loading}
    >
      {isBookmarked ? (
        <>
          <Heart className="h-4 w-4 mr-2 fill-current" />
          Favorited
        </>
      ) : (
        <>
          <HeartOff className="h-4 w-4 mr-2" />
          Add to Favorites
        </>
      )}
    </Button>
  )
}
