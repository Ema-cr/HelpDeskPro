import React from 'react';
import { Ticket } from '@/types';
import Badge from '../bagde/Badge';
import Button from '../button/Button';
import Link from 'next/link';

interface CardProps {
  ticket: Ticket;
  onViewDetails?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  role?: 'client' | 'agent';
  className?: string;
}

const Card: React.FC<CardProps> = ({
  ticket,
  onViewDetails,
  onDelete,
  showActions = true,
  role = 'client',
  className = '',
}) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const viewUrl = role === 'agent' 
    ? `/agent/ticket/${ticket._id}` 
    : `/client/ticket/${ticket._id}`;
  
  // Apply gray styling for closed tickets
  const cardBgColor = ticket.status === 'closed' ? 'bg-gray-100' : 'bg-white';
  const titleColor = ticket.status === 'closed' ? 'text-gray-500' : 'text-gray-900';
  const descriptionColor = ticket.status === 'closed' ? 'text-gray-400' : 'text-gray-600';
  
  return (
    <div className={`${cardBgColor} rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className={`text-lg font-semibold ${titleColor} flex-1`}>
          {ticket.title}
        </h3>
        <div className="flex gap-2 ml-4">
          <Badge variant="status" status={ticket.status} size="sm" />
          <Badge variant="priority" priority={ticket.priority} size="sm" />
        </div>
      </div>
      
      <p className={`${descriptionColor} text-sm mb-4 line-clamp-2`}>
        {ticket.description}
      </p>
      
      <div className="flex flex-col gap-2 text-sm text-gray-500 mb-4">
        <div className="flex justify-between">
          <span className="font-medium">Created:</span>
          <span>{formatDate(ticket.createdAt)}</span>
        </div>
        {typeof ticket.createdBy === 'object' && ticket.createdBy && (
          <div className="flex justify-between">
            <span className="font-medium">By:</span>
            <span>{ticket.createdBy.name}</span>
          </div>
        )}
        {role === 'agent' && (
          <div className="flex justify-between">
            <span className="font-medium">Assigned:</span>
            <span>
              {typeof ticket.assignedTo === 'object' && ticket.assignedTo
                ? ticket.assignedTo.name
                : 'Unassigned'}
            </span>
          </div>
        )}
      </div>
      
      {showActions && (
        <div className="flex gap-2">
          <Link href={viewUrl} className="flex-1">
            <Button variant="primary" size="sm" fullWidth>
              View Details
            </Button>
          </Link>
          {ticket.status === 'closed' && onDelete && role === 'agent' && (
            <Button 
              variant="danger" 
              size="sm" 
              onClick={() => onDelete(ticket._id)}
            >
              Delete
            </Button>
          )}
          {onViewDetails && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewDetails(ticket._id)}
            >
              Quick View
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Card;