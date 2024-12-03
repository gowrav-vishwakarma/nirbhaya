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
  userName?: string;
}
