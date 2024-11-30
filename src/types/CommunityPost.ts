export interface CommunityPost {
  id: number;
  title: string;
  description: string;
  mediaUrls: string[];
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive';
  postType: string;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  activeSlide?: number;
}
