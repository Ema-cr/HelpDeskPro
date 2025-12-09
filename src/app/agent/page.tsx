'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Ticket, TicketStatus, TicketPriority } from '@/types';
import { getTickets, deleteTicket } from '@/services/tickets';
import Button from '@/components/ui/button/Button';
import Card from '@/components/ui/card/Card';
import Select from '@/components/ui/select/Select';
import Swal from 'sweetalert2';

export default function AgentDashboard() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]); // Store all tickets for stats
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | ''>('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    } else if (user && user.role !== 'agent') {
      router.push('/client');
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (user && user.role === 'agent') {
      loadTickets();
    }
  }, [user, statusFilter, priorityFilter]);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      
      // Always load all tickets for stats
      const allData = await getTickets({});
      setAllTickets(allData);
      
      // Apply filters for display
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      if (priorityFilter) filters.priority = priorityFilter;
      
      const data = await getTickets(filters);
      
      // Exclude closed tickets unless specifically filtered
      const filteredData = statusFilter === 'closed' 
        ? data 
        : data.filter(ticket => ticket.status !== 'closed');
      
      setTickets(filteredData);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStats = () => {
    // Use allTickets for stats to always show real numbers regardless of filters
    const totalActive = allTickets.filter(t => t.status !== 'closed').length;
    
    return {
      total: totalActive, // Total of active tickets (excluding closed)
      open: allTickets.filter(t => t.status === 'open').length,
      inProgress: allTickets.filter(t => t.status === 'in_progress').length,
      resolved: allTickets.filter(t => t.status === 'resolved').length,
      closed: allTickets.filter(t => t.status === 'closed').length,
      highPriority: allTickets.filter(t => t.priority === 'high').length,
    };
  };

  const handleDeleteTicket = async (ticketId: string) => {
    const result = await Swal.fire({
      title: 'Delete Ticket?',
      text: 'This action cannot be undone. The ticket will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await deleteTicket(ticketId);
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'The ticket has been permanently deleted.',
          confirmButtonColor: '#3b82f6',
          timer: 2000,
          showConfirmButton: false
        });
        loadTickets();
      } catch (error) {
        console.error('Error deleting ticket:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete ticket',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HelpDeskPro - Agent Dashboard</h1>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <p className="text-sm text-blue-600">Open</p>
            <p className="text-2xl font-bold text-blue-900">{stats.open}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <p className="text-sm text-yellow-600">In Progress</p>
            <p className="text-2xl font-bold text-yellow-900">{stats.inProgress}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <p className="text-sm text-green-600">Resolved</p>
            <p className="text-2xl font-bold text-green-900">{stats.resolved}</p>
          </div>
          <div className="bg-gray-100 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Closed</p>
            <p className="text-2xl font-bold text-gray-900">{stats.closed}</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-4">
            <p className="text-sm text-red-600">High Priority</p>
            <p className="text-2xl font-bold text-red-900">{stats.highPriority}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg text-gray-950 font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TicketStatus | '')}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'open', label: 'Open' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'resolved', label: 'Resolved' },
                { value: 'closed', label: 'Closed' },
              ]}
            />
            <Select
              label="Priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | '')}
              options={[
                { value: '', label: 'All Priorities' },
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
            />
          </div>
          <div className="mt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setStatusFilter('');
                setPriorityFilter('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Tickets List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">All Tickets</h2>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600">Loading tickets...</div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg">No tickets found</p>
              <p className="text-gray-500 mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket) => (
                <Card
                  key={ticket._id}
                  ticket={ticket}
                  role="agent"
                  onDelete={handleDeleteTicket}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
