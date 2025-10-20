'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Filter, X } from 'react-feather'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Category {
  _id: string
  name: string
  createdAt: string
  updatedAt: string
}

export const CategoryFilter = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const selectedCategoryId = searchParams.get('categoryId')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
    } catch (error) {
      // Failed to fetch categories
    } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleCategorySelect = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (selectedCategoryId === categoryId) {
      // If clicking the same category, remove it
      params.delete('categoryId')
    } else {
      // Set the new category
      params.set('categoryId', categoryId)
    }
    
    router.push(`${pathname}?${params.toString()}`)
  }

  const clearFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('categoryId')
    router.push(`${pathname}?${params.toString()}`)
  }

  const getSelectedCategoryName = () => {
    if (!selectedCategoryId) return null
    return categories.find(cat => cat._id === selectedCategoryId)?.name
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        <span className="text-sm text-gray-500 dark:text-gray-400">Loading categories...</span>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Filter Button */}
      <div className="flex items-center gap-2">
        <Button
          variant={selectedCategoryId ? "default" : "outline"}
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <Filter size={16} />
          <span>Categories</span>
          {selectedCategoryId && (
            <Badge variant="secondary" className="ml-1 bg-gold/20 text-gold">
              {getSelectedCategoryName()}
            </Badge>
          )}
        </Button>
        
        {selectedCategoryId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilter}
            className="h-8 w-8 p-0"
          >
            <X size={16} />
          </Button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg dark:shadow-slate-900/50 z-20 max-h-80 overflow-y-auto">
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Filter by Category</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X size={16} />
                </Button>
              </div>
              
              <div className="space-y-1">
                {/* All Categories Option */}
                <button
                  onClick={() => {
                    clearFilter()
                    setIsOpen(false)
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                    !selectedCategoryId
                      ? "bg-gold/20 text-gold font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                  )}
                >
                  All Categories
                </button>
                
                {/* Category Options */}
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => {
                      handleCategorySelect(category._id)
                      setIsOpen(false)
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                      selectedCategoryId === category._id
                        ? "bg-gold/20 text-gold font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              
              {categories.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                  No categories available
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
