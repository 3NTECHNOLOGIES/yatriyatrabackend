import mongoose from 'mongoose';
import { ISession } from '../interfaces/user.interface';

const sessionSchema = new mongoose.Schema<ISession & mongoose.Document>(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Add indexes for faster queries
sessionSchema.index({ userId: 1 });
sessionSchema.index({ token: 1 });
sessionSchema.index({ expires: 1 });

const Session = mongoose.model<ISession & mongoose.Document>('Session', sessionSchema);

export default Session;
