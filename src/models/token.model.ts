import mongoose from 'mongoose';
import { ITokenDocument, ITokenModel } from '../interfaces/token.interface';

const tokenSchema = new mongoose.Schema<ITokenDocument, ITokenModel>(
  {
    token: {
      type: String,
      required: true,
    },
    user: {
      type: String,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['refresh', 'access', 'resetPassword', 'verifyEmail'],
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Create index for fast lookups
tokenSchema.index({ user: 1, type: 1 });
tokenSchema.index({ token: 1 });

const Token = mongoose.model<ITokenDocument, ITokenModel>('Token', tokenSchema);

export default Token;
