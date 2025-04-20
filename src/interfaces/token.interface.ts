import { Document, Model, Types } from 'mongoose';

export interface IToken {
  token: string;
  user: string;
  type: string;
  expires: Date;
  blacklisted: boolean;
}

export interface ITokenDocument extends IToken, Document {
  _id: Types.ObjectId;
}

export interface ITokenModel extends Model<ITokenDocument> {}

export type TokenType = 'refresh' | 'access' | 'resetPassword' | 'verifyEmail';
