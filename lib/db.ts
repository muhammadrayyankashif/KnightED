import User from './models/User'
import Course from './models/Course'
import Category from './models/Category'
import Chapter from './models/Chapter'
import Attachment from './models/Attachment'
import UserProgress from './models/UserProgress'
import VideoProgress from './models/VideoProgress'
import Enrollment from './models/Enrollment'
import Note from './models/Note'
import VideoNote from './models/VideoNote'
import PastPaper from './models/PastPaper'
import NoteProgress from './models/NoteProgress'
import PastPaperProgress from './models/PastPaperProgress'
import Comment from './models/Comment'
import CourseComment from './models/CourseComment'
import Bookmark from './models/Bookmark'
import Notification from './models/Notification'

export const db = {
  user: User,
  course: Course,
  category: Category,
  chapter: Chapter,
  attachment: Attachment,
  userProgress: UserProgress,
  videoProgress: VideoProgress,
  enrollment: Enrollment,
  note: Note,
  videoNote: VideoNote,
  pastPaper: PastPaper,
  noteProgress: NoteProgress,
  pastPaperProgress: PastPaperProgress,
  comment: Comment,
  courseComment: CourseComment,
  bookmark: Bookmark,
  notification: Notification,
}
