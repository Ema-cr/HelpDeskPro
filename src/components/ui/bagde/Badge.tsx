import React from 'react';
import { TicketStatus, TicketPriority } from '@/types';

type BadgeVariant = 'status' | 'priority' | 'default';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  status?: TicketStatus;
  priority?: TicketPriority;
  label?: string;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  status,
  priority,
  label,
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const sizeClasses: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };
  
  const getStatusClasses = (s: TicketStatus): string => {
    const statusMap: Record<TicketStatus, string> = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return statusMap[s];
  };
  
  const getPriorityClasses = (p: TicketPriority): string => {
    const priorityMap: Record<TicketPriority, string> = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800',
    };
    return priorityMap[p];
  };
  
  let variantClasses = 'bg-gray-100 text-gray-800';
  let displayLabel = label || '';
  
  if (variant === 'status' && status) {
    variantClasses = getStatusClasses(status);
    displayLabel = status.replace('_', ' ').toUpperCase();
  } else if (variant === 'priority' && priority) {
    variantClasses = getPriorityClasses(priority);
    displayLabel = priority.toUpperCase();
  }
  
  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses} ${className}`;
  
  return (
    <span className={classes}>
      {displayLabel}
    </span>
  );
};

export default Badge;