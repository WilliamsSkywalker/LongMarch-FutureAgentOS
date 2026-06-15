export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  bio?: string
  created_at: string
  updated_at: string
}

export interface App {
  id: number
  uuid: string
  name: string
  description: string
  author_id: number
  icon: string
  tags: string[]
  likes: number
  uses: number
  forks: number
  is_public: boolean
  code: { filename: string; content: string }[]
  preview_html: string
  forked_from?: number
  created_at: string
  updated_at: string
}

export interface Comment {
  id: number
  app_id: number
  user_id: number
  user_name: string
  user_avatar: string
  content: string
  created_at: string
}

export interface JwtPayload {
  userId: number
  email: string
}
