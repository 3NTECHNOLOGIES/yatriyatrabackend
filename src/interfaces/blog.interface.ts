import { Document, Model, Schema } from 'mongoose';

export enum BlogStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  PENDING = 'pending',
}

export interface IBlog {
  title: string;
  category: Schema.Types.ObjectId;
  content: string;
  featured?: boolean;
  author: Schema.Types.ObjectId;
  status: BlogStatus;
  views: number;
  coverImage?: string;
}

export interface IBlogDocument extends IBlog, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IBlogModel extends Model<IBlogDocument> {}
