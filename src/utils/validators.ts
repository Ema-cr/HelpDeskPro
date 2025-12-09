import { TicketStatus, TicketPriority } from '@/types';

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

export const isValidTicketStatus = (status: string): status is TicketStatus => {
  return ['open', 'in_progress', 'resolved', 'closed'].includes(status);
};

export const isValidTicketPriority = (priority: string): priority is TicketPriority => {
  return ['low', 'medium', 'high'].includes(priority);
};

export const isValidRole = (role: string): role is 'client' | 'agent' => {
  return ['client', 'agent'].includes(role);
};

export interface ValidationError {
  field: string;
  message: string;
}

export const validateTicketData = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Title is required' });
  }

  if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
    errors.push({ field: 'description', message: 'Description is required' });
  }

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Valid email is required' });
  }

  if (data.priority && !isValidTicketPriority(data.priority)) {
    errors.push({ field: 'priority', message: 'Invalid priority value' });
  }

  return errors;
};

export const validateLoginData = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.email || !isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Valid email is required' });
  }

  if (!data.password || data.password.length === 0) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return errors;
};