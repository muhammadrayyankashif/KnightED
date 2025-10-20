'use client'

import * as z from 'zod'
import axios from 'axios'
import { Pencil, PlusCircle, Video, Trash2, Play } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

interface Video {
  title: string
  youtubeUrl: string
  position: number
}

interface ChapterVideosFormProps {
  initialData: any // Chapter type from MongoDB
  courseId: string
  chapterId: string
}

const videoSchema = z.object({
  title: z.string().min(1, 'Video title is required'),
  youtubeUrl: z.string().min(1, 'YouTube URL is required').url('Please enter a valid URL'),
})

const formSchema = z.object({
  videos: z.array(videoSchema),
})

export const ChapterVideosForm = ({ initialData, courseId, chapterId }: ChapterVideosFormProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const router = useRouter()

  const toggleEdit = () => setIsEditing((current) => !current)
  const toggleAdding = () => setIsAdding((current) => !current)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videos: initialData.videos || [],
    },
  })

  const { isSubmitting } = form.formState

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, {
        videos: values.videos,
      })
      toast.success('Chapter videos updated')
      toggleEdit()
      router.refresh()
    } catch {
      toast.error('Something went wrong')
    }
  }

  const addVideo = () => {
    const currentVideos = form.getValues('videos')
    const newVideo = {
      title: '',
      youtubeUrl: '',
      position: currentVideos.length,
    }
    form.setValue('videos', [...currentVideos, newVideo])
    setIsAdding(true)
  }

  const removeVideo = (index: number) => {
    const currentVideos = form.getValues('videos')
    const updatedVideos = currentVideos.filter((_, i) => i !== index)
    // Update positions
    const reorderedVideos = updatedVideos.map((video, i) => ({
      ...video,
      position: i,
    }))
    form.setValue('videos', reorderedVideos)
  }

  const extractYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const getYouTubeThumbnail = (url: string) => {
    const videoId = extractYouTubeVideoId(url)
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null
  }

  const videos = form.watch('videos') || []

  return (
    <div className="mt-6 rounded-md border bg-slate-100 dark:bg-slate-800 p-4">
      <div className="flex items-center justify-between font-medium">
        Chapter videos
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && <>Cancel</>}
          {!isEditing && (
            <>
              <Pencil className="mr-2 h-4 w-4" />
              Edit videos
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        <div className="mt-4">
          {videos.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-md bg-muted">
              <div className="text-center">
                <Video className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No videos added yet</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {videos.map((video, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-background dark:bg-slate-800 rounded-md border dark:border-slate-700">
                  <div className="flex-shrink-0">
                    {getYouTubeThumbnail(video.youtubeUrl) ? (
                      <Image
                        src={getYouTubeThumbnail(video.youtubeUrl)!}
                        alt={video.title}
                        width={80}
                        height={48}
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="w-20 h-12 bg-muted rounded flex items-center justify-center">
                        <Play className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{video.title}</h4>
                    <p className="text-sm text-muted-foreground">Position: {index + 1}</p>
                  </div>
                </div>
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
              name="videos"
              render={() => (
                <FormItem>
                  <div className="space-y-4">
                    {videos.map((video, index) => (
                      <div key={index} className="p-4 bg-background dark:bg-slate-800 rounded-md border dark:border-slate-700">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-foreground">Video {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVideo(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={form.control}
                            name={`videos.${index}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Video Title</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter video title"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`videos.${index}.youtubeUrl`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>YouTube URL</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={addVideo}
                disabled={isSubmitting}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Video
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Videos'}
              </Button>
            </div>
          </form>
        </Form>
      )}

      {videos.length > 0 && !isEditing && (
        <div className="mt-2 text-xs text-muted-foreground">
          {videos.length} video{videos.length !== 1 ? 's' : ''} added to this chapter.
        </div>
      )}
    </div>
  )
}
