import mongoose from 'mongoose';
import { IBlog, IBlogDocument, IBlogModel, BlogStatus } from '../interfaces/blog.interface';

const blogSchema = new mongoose.Schema<IBlogDocument, IBlogModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BlogStatus),
      default: BlogStatus.DRAFT,
    },
    views: {
      type: Number,
      default: 0,
    },
    coverImage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Add plugin to convert mongoose schema to json
blogSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Blog = mongoose.model<IBlogDocument, IBlogModel>('Blog', blogSchema);

export default Blog;
