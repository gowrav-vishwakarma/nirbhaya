export interface Comment {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  parentId?: string;
}

export interface CommunityPost {
  id: number;
  title: string;
  description: string;
  userId: number;
  liked: boolean;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  mediaUrls?: string | string[];
  videoUrl?: string;
  tags?: string[];
  likes: number;
  shares: number;
  comments?: Comment[];
}

export interface Post extends CommunityPost {
  userName: string;
}
