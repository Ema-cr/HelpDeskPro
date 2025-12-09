import apiClient from './apiClient';
import { Ticket, TicketFilters, ApiResponse } from '@/types';

export async function getTickets(filters?: TicketFilters): Promise<Ticket[]> {
  const response = await apiClient.get<ApiResponse<Ticket[]>>('/api/tickets', {
    params: filters,
  });
  return response.data.data || [];
}

export async function getTicketById(id: string): Promise<Ticket> {
  const response = await apiClient.get<ApiResponse<Ticket>>(`/api/tickets/${id}`);
  return response.data.data!;
}

export async function createTicket(ticketData: Partial<Ticket>): Promise<Ticket> {
  const response = await apiClient.post<ApiResponse<Ticket>>('/api/tickets', ticketData);
  return response.data.data!;
}

export async function updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket> {
  const response = await apiClient.put<ApiResponse<Ticket>>(`/api/tickets/${id}`, updates);
  return response.data.data!;
}

export async function deleteTicket(id: string): Promise<void> {
  await apiClient.delete(`/api/tickets/${id}`);
}