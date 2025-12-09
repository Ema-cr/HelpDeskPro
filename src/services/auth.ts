import apiClient from './apiClient';
import { LoginCredentials, AuthResponse, User } from '@/types';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
  return response.data;
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<{ user: User }>('/api/auth/me');
  return response.data.user;
}

export function logout(): void {
  localStorage.removeItem('token');
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}