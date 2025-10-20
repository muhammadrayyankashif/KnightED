'use client'

import { useState } from 'react'
import { Trash2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface Category {
  _id: string
  name: string
  createdAt: string
}

interface CategoryListProps {
  categories: Category[]
}

export const CategoryList = ({ categories }: CategoryListProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const onDelete = async (id: string) => {
    try {
      setDeletingId(id)
      await axios.delete(`/api/categories/${id}`)
      toast.success('Category deleted successfully')
      router.refresh()
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setDeletingId(null)
    }
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No categories found. Create your first category!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories ({categories.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category._id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{category.name}</Badge>
                <span className="text-sm text-muted-foreground">
                  Created {new Date(category.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(category._id)}
                  disabled={deletingId === category._id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
