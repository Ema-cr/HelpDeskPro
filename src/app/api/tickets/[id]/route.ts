import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import Ticket from '@/models/Ticket';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { sendTicketClosedEmail } from '@/lib/mailer';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await params;
    const ticket = await Ticket.findById(id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    
    if (!ticket) {
      return NextResponse.json(
        { success: false, message: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    // Check permissions
    const createdById = typeof ticket.createdBy === 'object' && ticket.createdBy ? ticket.createdBy._id.toString() : ticket.createdBy;
    if (decoded.role === 'client' && createdById !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: ticket,
    });
  } catch (error: any) {
    console.error('Get ticket error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    
    const ticket = await Ticket.findById(id);
    
    if (!ticket) {
      return NextResponse.json(
        { success: false, message: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    // Only agents can update certain fields
    if (decoded.role === 'agent') {
      // Agents can update everything
      Object.assign(ticket, body);
    } else {
      // Clients can only update description and priority
      if (body.description) ticket.description = body.description;
      if (body.priority) ticket.priority = body.priority;
    }
    
    const previousStatus = ticket.status;
    await ticket.save();
    
    const updatedTicket = await Ticket.findById(id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    
    // Send email if ticket was closed
    if (previousStatus !== 'closed' && body.status === 'closed') {
      try {
        await sendTicketClosedEmail(updatedTicket!);
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }
    }
    
    return NextResponse.json({
      success: true,
      data: updatedTicket,
      message: 'Ticket updated successfully',
    });
  } catch (error: any) {
    console.error('Update ticket error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    if (!decoded || decoded.role !== 'agent') {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
    }
    
    const { id } = await params;
    const ticket = await Ticket.findById(id);
    
    if (!ticket) {
      return NextResponse.json(
        { success: false, message: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    // Only allow deletion of closed tickets
    if (ticket.status !== 'closed') {
      return NextResponse.json(
        { success: false, message: 'Only closed tickets can be deleted' },
        { status: 400 }
      );
    }
    
    await Ticket.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Ticket deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete ticket error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}