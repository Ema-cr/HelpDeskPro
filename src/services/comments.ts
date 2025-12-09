import apiClient from './apiClient';
import { Comment, ApiResponse } from '@/types';

export async function getCommentsByTicket(ticketId: string): Promise<Comment[]> {
  const response = await apiClient.get<ApiResponse<Comment[]>>('/api/comments', {
    params: { ticketId },
  });
  return response.data.data || [];
}

export async function createComment(commentData: {
  ticketId: string;
  message: string;
  isInternal?: boolean;
}): Promise<Comment> {
  const response = await apiClient.post<ApiResponse<Comment>>('/api/comments', commentData);
  return response.data.data!;
}