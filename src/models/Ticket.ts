import mongoose, { Schema, Model } from 'mongoose';
import { Ticket as ITicket } from '@/types';

interface ITicketDocument extends Omit<ITicket, '_id'>, mongoose.Document {}

const TicketSchema = new Schema<ITicketDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
TicketSchema.index({ createdBy: 1, status: 1 });
TicketSchema.index({ assignedTo: 1, status: 1 });
TicketSchema.index({ status: 1, priority: 1 });
TicketSchema.index({ createdAt: -1 });

const Ticket: Model<ITicketDocument> = 
  mongoose.models.Ticket || mongoose.model<ITicketDocument>('Ticket', TicketSchema);

export default Ticket;