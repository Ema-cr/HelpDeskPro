'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Ticket, Comment } from '@/types';
import { getTicketById } from '@/services/tickets';
import { getCommentsByTicket, createComment } from '@/services/comments';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/bagde/Badge';
import Textarea from '@/components/ui/textarea/Textarea';
import Swal from 'sweetalert2';

export default function ClientTicketDetail() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    loadTicketData();
  }, [params.id]);

  const loadTicketData = async () => {
    try {
      setIsLoading(true);
      const ticketData = await getTicketById(params.id as string);
      const commentsData = await getCommentsByTicket(params.id as string);
      setTicket(ticketData);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading ticket:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      await createComment({
        ticketId: params.id as string,
        message: newComment,
      });
      setNewComment('');
      loadTicketData();
      
      await Swal.fire({
        icon: 'success',
        title: 'Comment Added!',
        text: 'Your message has been sent to the support team.',
        confirmButtonColor: '#3b82f6',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add comment',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Ticket not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="secondary" size="sm" onClick={() => router.push('/client')}>
            ← Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ticket Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
            <div className="flex gap-2">
              <Badge variant="status" status={ticket.status} />
              <Badge variant="priority" priority={ticket.priority} />
            </div>
          </div>
          <div className="text-gray-600 mb-4">
            <p className="mb-2"><strong>Description:</strong></p>
            <p className="whitespace-pre-wrap">{ticket.description}</p>
          </div>
          <div className="text-sm text-gray-500">
            <p>Created: {new Date(ticket.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl text-gray-950 font-semibold bg- mb-4">Comments</h2>
          
          {/* Comments List */}
          <div className="space-y-4 mb-6">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment._id}
                  className={`p-4 rounded-lg ${
                    typeof comment.author === 'object' && comment.author.role === 'agent'
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900">
                      {typeof comment.author === 'object' ? comment.author.name : 'Unknown'}
                      {typeof comment.author === 'object' && comment.author.role === 'agent' && (
                        <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                          Agent
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.message}</p>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment}>
            <Textarea
              label="Add a comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Type your message..."
              rows={4}
            />
            <div className="mt-4">
              <Button type="submit" isLoading={isSubmitting}>
                Send Comment
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
