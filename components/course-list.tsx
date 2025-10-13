import { CourseWithProgressAndCategory } from '@/actions/get-courses'
import CourseListItem from './course-list-item'

type CoursesListProps = {
  items: CourseWithProgressAndCategory[]
}

export default function CoursesList({ items }: CoursesListProps) {
  return (
    <div>
      <div className="space-y-4">
        {items.map((course) => (
          <CourseListItem
            key={course._id}
            id={course._id}
            title={course.title}
            description={course.description}
            imageUrl={course.imageUrl}
            progress={course.progress}
            chaptersLength={course.chapters?.length || 0}
            category={course?.category?.name ?? ''}
            progressDetails={course.progressDetails}
          />
        ))}
      </div>

      {items.length === 0 ? (
        <div className="mt-10 text-center text-sm text-muted-foreground">No courses found!</div>
      ) : null}
    </div>
  )
}
