export interface Department {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  photo_url?: string;
  department_id?: string;
  position?: string;
  phone?: string;
  status: 'active' | 'inactive';
  role_id?: string;
  admission_date?: string;
  created_at: string;
  updated_at: string;
  departments?: Department;
  roles?: Role;
}

export interface Post {
  id: string;
  author_id?: string;
  title?: string;
  content: string;
  type: 'message' | 'announcement' | 'alert' | 'update' | 'event' | 'poll';
  image_url?: string;
  video_url?: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
  users?: User;
  comments?: Comment[];
  likes?: Like[];
  _count?: { comments: number; likes: number };
}

export interface Comment {
  id: string;
  post_id: string;
  author_id?: string;
  content: string;
  created_at: string;
  users?: User;
}

export interface Like {
  id: string;
  post_id: string;
  user_id?: string;
  created_at: string;
}

export interface PostReaction {
  id: string;
  post_id: string;
  user_id?: string;
  reaction: 'like' | 'love' | 'celebrate' | 'insightful';
  created_at: string;
}

export interface PostBookmark {
  id: string;
  post_id: string;
  user_id?: string;
  created_at: string;
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id?: string;
  role: 'owner' | 'moderator' | 'member';
  created_at: string;
}

export interface MediaAsset {
  id: string;
  bucket: 'avatars' | 'post-media' | 'wiki-attachments' | 'training-media';
  path: string;
  public_url?: string;
  file_name: string;
  file_type?: string;
  file_size?: number;
  owner_id?: string;
  context: 'avatar' | 'cover' | 'post' | 'wiki' | 'training' | 'general';
  post_id?: string;
  wiki_article_id?: string;
  training_id?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parent_id?: string;
  type: 'training' | 'wiki';
  created_at: string;
}

export interface Training {
  id: string;
  title: string;
  description?: string;
  category_id?: string;
  thumbnail_url?: string;
  video_url?: string;
  pdf_url?: string;
  duration_minutes: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published' | 'archived';
  created_by?: string;
  created_at: string;
  updated_at: string;
  categories?: Category;
  users?: User;
  training_progress?: TrainingProgress[];
}

export interface TrainingProgress {
  id: string;
  training_id: string;
  user_id?: string;
  progress: number;
  completed: boolean;
  completed_at?: string;
  started_at: string;
}

export interface WikiArticle {
  id: string;
  title: string;
  slug: string;
  content?: string;
  category_id?: string;
  author_id?: string;
  status: 'draft' | 'published' | 'archived';
  tags?: string[];
  created_at: string;
  updated_at: string;
  categories?: Category;
  users?: User;
}

export interface Notification {
  id: string;
  user_id?: string;
  title: string;
  message?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  link?: string;
  created_at: string;
}
