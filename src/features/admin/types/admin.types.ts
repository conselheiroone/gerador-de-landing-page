import type { Database } from '@/integrations/supabase/types'

export type AdminSetting = Database['public']['Tables']['admin_settings']['Row']
export type AdminSettingInsert = Database['public']['Tables']['admin_settings']['Insert']

export type LegalPage = Database['public']['Tables']['legal_pages']['Row']
export type LegalPageVersion = Database['public']['Tables']['legal_page_versions']['Row']

export type Announcement = Database['public']['Tables']['announcements']['Row']
export type AnnouncementInsert = Database['public']['Tables']['announcements']['Insert']

export type LearningModule = Database['public']['Tables']['learning_modules']['Row']
export type LearningModuleInsert = Database['public']['Tables']['learning_modules']['Insert']

export type LearningLesson = Database['public']['Tables']['learning_lessons']['Row']
export type LearningLessonInsert = Database['public']['Tables']['learning_lessons']['Insert']

export type LearningAttachment = Database['public']['Tables']['learning_attachments']['Row']

export type HelpTip = Database['public']['Tables']['help_tips']['Row']

export type AnnouncementType = 'info' | 'warning' | 'maintenance' | 'update'
export type AnnouncementPriority = 'normal' | 'high'

export type AnnouncementStatus = 'published' | 'draft' | 'expired'

export interface AdminUser {
  id: string
  email: string
  nome: string | null
  empresa: string | null
  role: 'admin' | 'avancado' | 'cliente'
  created_at: string
}
