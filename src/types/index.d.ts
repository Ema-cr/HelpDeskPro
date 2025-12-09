// User Types
export type UserRole = 'client' | 'agent';

export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Ticket Types
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface Ticket {
  _id: string;
  title: string;
  name: string;
  email: string;
  description: string;
  createdBy: string | User;
  assignedTo?: string | User;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: Date;
  updatedAt: Date;
}

// Comment Types
export interface Comment {
  _id: string;
  ticketId: string | Ticket;
  author: string | User;
  message: string;
  isInternal: boolean;
  createdAt: Date;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Filter Types
export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedTo?: string;
  createdBy?: string;
}
