import cron from 'node-cron';
import connectDB from '@/lib/mongo';
import Ticket from '@/models/Ticket';
import User from '@/models/User';
import Comment from '@/models/Comment';
import { sendReminderEmail } from '@/lib/mailer';

const CRON_ENABLED = process.env.CRON_REMINDER_ENABLED === 'true';
const HOURS_THRESHOLD = parseInt(process.env.CRON_REMINDER_HOURS_THRESHOLD || '24');

// Check for tickets without responses and send reminders
export async function checkUnrespondedTickets() {
  try {
    await connectDB();
    console.log('🔍 Checking for unresponded tickets...');

    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - HOURS_THRESHOLD);

    console.log(`⏰ Looking for tickets created before: ${thresholdDate.toISOString()}`);

    // Find open/in_progress tickets created before threshold with no comments
    const tickets = await Ticket.find({
      status: { $in: ['open', 'in_progress'] },
      createdAt: { $lte: thresholdDate }, // Changed to $lte to include tickets at exact threshold
    }).populate('createdBy assignedTo');

    console.log(`📋 Found ${tickets.length} open/in-progress tickets created before threshold`);

    if (tickets.length === 0) {
      console.log('✅ No unresponded tickets found');
      return;
    }

    console.log(`📧 Found ${tickets.length} tickets needing attention`);

    // Group tickets by assigned agent or get all agents
    const ticketsByAgent: { [key: string]: any[] } = {};

    for (const ticket of tickets) {
      // Check if ticket has any comments
      const commentCount = await Comment.countDocuments({ ticketId: ticket._id.toString() });
      
      if (commentCount === 0) {
        // No comments yet - needs attention
        if (ticket.assignedTo) {
          const agentId = (ticket.assignedTo as any)._id.toString();
          if (!ticketsByAgent[agentId]) {
            ticketsByAgent[agentId] = [];
          }
          ticketsByAgent[agentId].push(ticket);
        } else {
          // Not assigned - notify all agents
          const agents = await User.find({ role: 'agent' });
          for (const agent of agents) {
            const agentId = agent._id.toString();
            if (!ticketsByAgent[agentId]) {
              ticketsByAgent[agentId] = [];
            }
            if (!ticketsByAgent[agentId].find(t => t._id.toString() === ticket._id.toString())) {
              ticketsByAgent[agentId].push(ticket);
            }
          }
        }
      }
    }

    // Send emails to agents
    for (const [agentId, agentTickets] of Object.entries(ticketsByAgent)) {
      const agent = await User.findById(agentId);
      if (agent && agentTickets.length > 0) {
        try {
          await sendReminderEmail(agent.email, agentTickets);
          console.log(`✅ Reminder sent to ${agent.email} for ${agentTickets.length} ticket(s)`);
        } catch (error) {
          console.error(`❌ Failed to send reminder to ${agent.email}:`, error);
        }
      }
    }

    console.log('✅ Reminder check completed');
  } catch (error) {
    console.error('❌ Error checking unresponded tickets:', error);
  }
}

// Initialize cron job
export function initCronJobs() {
  if (!CRON_ENABLED) {
    console.log('⏸️  Cron jobs are disabled');
    return;
  }

  // Run every 6 hours in production
  cron.schedule('0 */6 * * *', async () => {
    console.log('⏰ Running scheduled reminder check...');
    await checkUnrespondedTickets();
  });

  console.log('✅ Cron jobs initialized - reminders will run every 6 hours');
}
