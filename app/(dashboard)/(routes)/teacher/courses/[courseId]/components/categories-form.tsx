'use client'

import * as z from 'zod'
import axios from 'axios'
import { Pencil, PlusCircle, X } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

interface Category {
  _id: string
  name: string
}

interface CategoriesFormProps {
  initialData: any // Course type from MongoDB
  courseId: string
  options: { label: string; value: string }[]
}

const formSchema = z.object({
  categoryIds: z.array(z.string()),
})

export const CategoriesForm = ({ initialData, courseId, options }: CategoriesFormProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()

  const toggleEdit = () => setIsEditing((current) => !current)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryIds: initialData.categoryIds || (initialData.categoryId ? [initialData.categoryId] : []),
    },
  })

  const { isSubmitting } = form.formState

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, {
        categoryIds: values.categoryIds,
      })
      toast.success('Course categories updated')
      toggleEdit()
      router.refresh()
    } catch {
      toast.error('Something went wrong')
    }
  }

  const selectedCategoryIds = form.watch('categoryIds') || []
  const selectedCategories = options.filter(option => selectedCategoryIds.includes(option.value))

  return (
    <div className="mt-6 rounded-md border bg-slate-100 dark:bg-slate-800 p-4">
      <div className="flex items-center justify-between font-medium">
        Course categories
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && <>Cancel</>}
          {!isEditing && (
            <>
              <Pencil className="mr-2 h-4 w-4" />
              Edit categories
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        <div className="mt-4">
          {selectedCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No categories selected</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((category) => (
                <Badge key={category.value} variant="secondary">
                  {category.label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <FormField
              control={form.control}
              name="categoryIds"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Categories</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Select one or more categories for this course
                    </p>
                  </div>
                  {options.map((option) => (
                    <FormField
                      key={option.value}
                      control={form.control}
                      name="categoryIds"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={option.value}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.value)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, option.value])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== option.value
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Categories'}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
}
