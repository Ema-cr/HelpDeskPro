import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import Comment from '@/models/Comment';
import Ticket from '@/models/Ticket';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { sendCommentAddedEmail } from '@/lib/mailer';

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
    
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('ticketId');
    
    if (!ticketId) {
      return NextResponse.json(
        { success: false, message: 'Ticket ID is required' },
        { status: 400 }
      );
    }
    
    // Check if user has access to this ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return NextResponse.json(
        { success: false, message: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    if (decoded.role === 'client' && ticket.createdBy.toString() !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
    }
    
    let query: any = { ticketId };
    
    // Clients cannot see internal comments
    if (decoded.role === 'client') {
      query.isInternal = false;
    }
    
    const comments = await Comment.find(query)
      .populate('author', 'name email role')
      .sort({ createdAt: 1 });
    
    return NextResponse.json({
      success: true,
      data: comments,
    });
  } catch (error: any) {
    console.error('Get comments error:', error);
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
    const { ticketId, message, isInternal } = body;
    
    if (!ticketId || !message) {
      return NextResponse.json(
        { success: false, message: 'Ticket ID and message are required' },
        { status: 400 }
      );
    }
    
    // Check if ticket exists
    const ticket = await Ticket.findById(ticketId)
      .populate('createdBy', 'name email');
    
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
    
    // Only agents can create internal comments
    const commentIsInternal = decoded.role === 'agent' && isInternal === true;
    
    const comment = await Comment.create({
      ticketId,
      author: decoded.userId,
      message,
      isInternal: commentIsInternal,
    });
    
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name email role');
    
    // Send email notification if agent replied
    if (decoded.role === 'agent' && !commentIsInternal) {
      try {
        await sendCommentAddedEmail(ticket, populatedComment!);
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }
    }
    
    return NextResponse.json(
      {
        success: true,
        data: populatedComment,
        message: 'Comment added successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}