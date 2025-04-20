import { Document, Model } from 'mongoose';

export interface ICategory {
  name: string;
  slug: string;
  description: string;
  postCount: number;
}

export interface ICategoryDocument extends ICategory, Document {}

export interface ICategoryModel extends Model<ICategoryDocument> {
  isSlugTaken(slug: string, excludeCategoryId?: string): Promise<boolean>;
}
