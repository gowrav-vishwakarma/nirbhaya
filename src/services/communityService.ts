import { api } from 'src/boot/axios';

export const communityService = {
  async getBusinessWhatsApp(postId: string) {
    const response = await api.get(`/community/business-whatsapp/${postId}`);
    return response.data;
  },
};
