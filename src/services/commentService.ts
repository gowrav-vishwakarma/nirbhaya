import { api } from 'src/boot/axios';

export const commentService = {
  async addComment(
    postId: string | number,
    commentData: { content: string; userId: string }
  ) {
    const response = await api.post(`posts/${postId}/comments`, commentData);
    return response.data;
  },

  async getComments(postId: string) {
    const response = await api.get(`posts/${postId}/comments`);
    return response.data;
  },

  async deleteComment(commentId: string) {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },
};