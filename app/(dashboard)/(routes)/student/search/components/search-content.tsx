'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SearchInput } from '@/components/search-input'
import { CategoryFilter } from './category-filter'
import CoursesList from '@/components/course-list'
import { CourseSkeletonList } from '@/components/skeletons/course-skeleton'
import { EmptyState } from '@/components/empty-state'
import { BookOpen } from 'lucide-react'

interface SearchContentProps {
  userId: string
}

function SearchContentInner({ userId }: SearchContentProps) {
  const searchParams = useSearchParams()
  const title = searchParams.get('title') || ''
  const categoryId = searchParams.get('categoryId') || ''
  const [courses, setCourses] = useState<any[]>([])
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([])
  const [favoriteCourses, setFavoriteCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [favoritesLoading, setFavoritesLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        // Build query parameters
        const params = new URLSearchParams()
        if (title) params.append('title', title)
        if (categoryId) params.append('categoryId', categoryId)
        
        const response = await fetch(`/api/courses/search?${params.toString()}`, {
          credentials: 'include',
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const fetchedCourses = await response.json()
        setCourses(fetchedCourses)
      } catch (error) {
        setCourses([])
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [userId, title, categoryId])

  // Fetch featured courses
  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        setFeaturedLoading(true)
        const response = await fetch('/api/courses/featured', {
          credentials: 'include',
        })
        
        if (response.ok) {
          const featured = await response.json()
          setFeaturedCourses(featured)
        }
    } catch (error) {
      // Failed to fetch featured courses
    } finally {
        setFeaturedLoading(false)
      }
    }

    fetchFeaturedCourses()
  }, [])

  // Fetch favorite courses
  useEffect(() => {
    const fetchFavoriteCourses = async () => {
      try {
        setFavoritesLoading(true)
        const response = await fetch('/api/bookmarks', {
          credentials: 'include',
        })
        
        if (response.ok) {
          const bookmarks = await response.json()
          const favorites = bookmarks.map((bookmark: any) => bookmark.course)
          setFavoriteCourses(favorites)
        }
      } catch (error) {
        // Handle error silently
      } finally {
        setFavoritesLoading(false)
      }
    }

    fetchFavoriteCourses()
  }, [])

  return (
    <>
      {/* Mobile Search Input */}
      <div className="block px-6 pt-6 md:mb-0 md:hidden">
        <SearchInput />
      </div>
      
      {/* Desktop Search and Filters */}
      <div className="hidden md:block px-6 pt-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <SearchInput />
          </div>
          <div className="flex items-center gap-4">
            <CategoryFilter />
          </div>
        </div>
      </div>

      {/* Mobile Filters */}
      <div className="block md:hidden px-6 pt-4">
        <div className="flex items-center justify-end gap-4">
          <CategoryFilter />
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6 p-6">
        {/* Featured Courses Section - Only show when not loading initial page and featured courses exist */}
        {!title && !categoryId && !loading && !featuredLoading && featuredCourses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold dark:text-gray-50">⭐ Featured Courses</h2>
            </div>
            <CoursesList items={featuredCourses} />
          </div>
        )}

        {/* Favorite Courses Section - Only show when not loading initial page and favorite courses exist */}
        {!title && !categoryId && !loading && !favoritesLoading && favoriteCourses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold dark:text-gray-50">❤️ My Favorites</h2>
            </div>
            <CoursesList items={favoriteCourses} />
          </div>
        )}

        {/* All Courses Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold dark:text-gray-50">
                {title || categoryId ? 'Search Results' : 'All Courses'}
              </h2>
              {title && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Results for &quot;{title}&quot;
                </p>
              )}
              {categoryId && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Filtered by category
                </p>
              )}
            </div>
            {!loading && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {courses.length} course{courses.length !== 1 ? 's' : ''} found
              </div>
            )}
          </div>

          {/* Courses List */}
          <div>
            {loading ? (
              <CourseSkeletonList count={6} />
            ) : courses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title={title || categoryId ? 'No courses found' : 'No courses available'}
                description={title || categoryId ? 'Try adjusting your search or filter criteria.' : 'Start exploring courses to begin your learning journey.'}
              />
            ) : (
              <CoursesList items={courses} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export function SearchContent({ userId }: SearchContentProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContentInner userId={userId} />
    </Suspense>
  )
}
