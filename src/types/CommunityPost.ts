export interface Comment {
  id: string;
  content: string;
  userId: string;
  postId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
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
  isBusinessPost?: boolean;
  businessCategory?: string;
}

export interface Post extends CommunityPost {
  userName: string;
}
