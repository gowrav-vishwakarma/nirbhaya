import { api } from 'src/boot/axios';
import { CommunityPost } from 'src/types/CommunityPost';
import type { Comment } from 'src/types/CommunityPost';

interface PostFilters {
  postType: string;
  priority: string;
  status: string;
  search: string;
  page: number;
}

interface PostsResponse {
  data: CommunityPost[];
  totalPages: number;
}

export const communityPostService = {
  async getPosts(filters: PostFilters): Promise<PostsResponse> {
    const response = await api.get('posts/community-posts', {
      params: filters,
    });
    return response.data;
  },

  async deletePost(id: number): Promise<void> {
    await api.delete(`/community-posts/${id}`);
  },

  async likePost(postId: number, userId: number) {
    const response = await api.post(`/posts/${postId}/like`, {
      userId,
      postId,
    });
    return response.data;
  },

  async unlikePost(postId: number, userId: number) {
    const response = await api.post(`/posts/${postId}/unlike`, {
      userId,
      postId,
    });
    return response.data;
  },

  async checkIfLiked(postId: number, userId: number) {
    const response = await api.get(`/community-posts/${postId}/like/${userId}`);
    return response.data;
  },

  async addComment(postId: string | number, content: string): Promise<Comment> {
    try {
      const response = await api.post(`/posts/${postId}/comments`, {
        content,
        postId: Number(postId),
      });
      return response.data;
    } catch (error) {
      console.error('Error in addComment:', error);
      throw error;
    }
  },

  async sharePost(postId: string): Promise<void> {
    await api.post(`/posts/${postId}/share`);
  },

  async getLikes(postId: number | string) {
    try {
      const response = await api.get(`/posts/${postId}/likes`);
      return response.data;
    } catch (error) {
      console.error('Error fetching likes:', error);
      throw error;
    }
  },
};
