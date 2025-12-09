import mongoose, { Schema, Model } from 'mongoose';
import { Comment as IComment } from '@/types';

interface ICommentDocument extends Omit<IComment, '_id'>, mongoose.Document {}

const CommentSchema = new Schema<ICommentDocument>(
  {
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    isInternal: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
CommentSchema.index({ ticketId: 1, createdAt: 1 });
CommentSchema.index({ author: 1 });

const Comment: Model<ICommentDocument> = 
  mongoose.models.Comment || mongoose.model<ICommentDocument>('Comment', CommentSchema);

export default Comment;