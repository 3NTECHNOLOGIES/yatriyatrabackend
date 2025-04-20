import mongoose from 'mongoose';
import { ICategory, ICategoryDocument, ICategoryModel } from '../interfaces/category.interface';

const categorySchema = new mongoose.Schema<ICategoryDocument, ICategoryModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    postCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Add plugin to convert mongoose schema to json
categorySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

/**
 * Check if slug is taken
 * @param {string} slug - The category's slug
 * @param {ObjectId} [excludeCategoryId] - The id of the category to be excluded
 * @returns {Promise<boolean>}
 */
categorySchema.statics.isSlugTaken = async function (
  slug: string,
  excludeCategoryId?: string,
): Promise<boolean> {
  const category = await this.findOne({ slug, _id: { $ne: excludeCategoryId } });
  return !!category;
};

const Category = mongoose.model<ICategoryDocument, ICategoryModel>('Category', categorySchema);

export default Category;
