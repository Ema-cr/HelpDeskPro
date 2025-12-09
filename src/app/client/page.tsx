'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Ticket } from '@/types';
import { getTickets, createTicket } from '@/services/tickets';
import Button from '@/components/ui/button/Button';
import Card from '@/components/ui/card/Card';
import Input from '@/components/ui/input/Input';
import Textarea from '@/components/ui/textarea/Textarea';
import Select from '@/components/ui/select/Select';
import Swal from 'sweetalert2';

export default function ClientDashboard() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    email: '',
    description: '',
    priority: 'medium' as const,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    } else if (user && user.role !== 'client') {
      router.push('/agent');
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (user && user.role === 'client') {
      loadTickets();
    }
  }, [user]);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      const data = await getTickets();
      // Exclude closed tickets from client view
      const filteredData = data.filter(ticket => ticket.status !== 'closed');
      setTickets(filteredData);
    } catch (error: any) {
      console.error('Error loading tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    try {
      await createTicket(formData);
      
      await Swal.fire({
        icon: 'success',
        title: 'Ticket Created!',
        text: 'Your support ticket has been created successfully.',
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'OK'
      });
      
      setFormData({
        title: '',
        name: '',
        email: '',
        description: '',
        priority: 'medium',
      });
      setShowCreateForm(false);
      loadTickets();
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to create ticket',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK'
      });
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HelpDeskPro</h1>
              <p className="text-sm text-gray-600">Welcome, {user.name}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Create Ticket Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">My Tickets</h2>
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              {showCreateForm ? 'Cancel' : 'Create New Ticket'}
            </Button>
          </div>

          {showCreateForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg text-gray-950 font-semibold mb-4">Create New Ticket</h3>
              {formError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {formError}
                </div>
              )}
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <Input
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Brief description of your issue"
                />
                <Input
                  label="Your Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <Select
                  label="Priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                  ]}
                />
                <Textarea
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Describe your issue in detail..."
                  rows={6}
                />
                <div className="flex gap-4">
                  <Button type="submit" variant="success">
                    Submit Ticket
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Tickets List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Loading tickets...</div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No tickets yet</p>
            <p className="text-gray-500 mt-2">Create your first ticket to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <Card
                key={ticket._id}
                ticket={ticket}
                role="client"
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
