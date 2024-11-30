import { api } from 'src/boot/axios';
import { CommunityPost } from 'src/types/CommunityPost';

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
};
