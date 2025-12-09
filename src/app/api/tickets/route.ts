import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import Ticket from '@/models/Ticket';
import User from '@/models/User';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { validateTicketData } from '@/utils/validators';
import { sendTicketCreatedEmail } from '@/lib/mailer';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo');
    
    // Build query
    let query: any = {};
    
    if (decoded.role === 'client') {
      // Clients can only see their own tickets
      query.createdBy = decoded.userId;
    }
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    
    const tickets = await Ticket.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: tickets,
    });
  } catch (error: any) {
    console.error('Get tickets error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate input
    const errors = validateTicketData(body);
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors },
        { status: 400 }
      );
    }
    
    // Get all agents for balanced assignment
    const agents = await User.find({ role: 'agent' });
    let assignedAgentId = null;
    
    if (agents.length > 0) {
      // Count open tickets for each agent
      const agentTicketCounts = await Promise.all(
        agents.map(async (agent) => {
          const count = await Ticket.countDocuments({
            assignedTo: agent._id.toString(),
            status: { $in: ['open', 'in-progress'] }
          });
          return { agentId: agent._id.toString(), count };
        })
      );
      
      // Find agents with minimum tickets
      const minCount = Math.min(...agentTicketCounts.map(a => a.count));
      const agentsWithMinTickets = agentTicketCounts.filter(a => a.count === minCount);
      
      // Randomly select one agent from those with minimum tickets
      const randomIndex = Math.floor(Math.random() * agentsWithMinTickets.length);
      assignedAgentId = agentsWithMinTickets[randomIndex].agentId;
    }
    
    // Create ticket
    const ticketDoc = new Ticket({
      ...body,
      createdBy: decoded.userId,
      assignedTo: assignedAgentId,
      status: 'open',
    });
    await ticketDoc.save();
    
    const populatedTicket = await Ticket.findById(ticketDoc._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    
    // Send email notification
    try {
      await sendTicketCreatedEmail(populatedTicket!);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Continue even if email fails
    }
    
    return NextResponse.json(
      {
        success: true,
        data: populatedTicket,
        message: 'Ticket created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create ticket error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}