import { IBlog, IBlogDocument, BlogStatus } from '../interfaces/blog.interface';
import Blog from '../models/blog.model';
import Category from '../models/category.model';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';
import mongoose from 'mongoose';

/**
 * Create a blog
 * @param {IBlog} blogBody
 * @returns {Promise<IBlogDocument>}
 */
export const createBlog = async (blogBody: IBlog): Promise<IBlogDocument> => {
  const blog = await Blog.create(blogBody);

  // Increment the post count for the category
  if (blogBody.category) {
    await Category.findByIdAndUpdate(blogBody.category, { $inc: { postCount: 1 } });
  }

  return blog;
};

/**
 * Save blog as draft
 * @param {Partial<IBlog>} blogBody
 * @returns {Promise<IBlogDocument>}
 */
export const saveBlogAsDraft = async (blogBody: Partial<IBlog>): Promise<IBlogDocument> => {
  const draftBlog = {
    ...blogBody,
    status: BlogStatus.DRAFT,
  };
  const blog = await Blog.create(draftBlog);

  // Increment the post count for the category
  if (blogBody.category) {
    await Category.findByIdAndUpdate(blogBody.category, { $inc: { postCount: 1 } });
  }

  return blog;
};

/**
 * Publish a blog
 * @param {string} blogId
 * @returns {Promise<IBlogDocument>}
 */
export const publishBlog = async (blogId: string): Promise<IBlogDocument> => {
  const blog = await getBlogById(blogId);

  if (blog.status === BlogStatus.PUBLISHED) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Blog is already published');
  }

  blog.status = BlogStatus.PUBLISHED;
  await blog.save({ validateBeforeSave: false }); // Skip validation to prevent author field error
  return blog;
};

/**
 * Increment blog views
 * @param {string} blogId
 * @returns {Promise<IBlogDocument>}
 */
export const incrementBlogViews = async (blogId: string): Promise<IBlogDocument> => {
  const blog = await Blog.findByIdAndUpdate(blogId, { $inc: { views: 1 } }, { new: true })
    .populate('category', 'name slug')
    .populate('author', 'name email');

  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }

  return blog;
};

/**
 * Get all blogs with pagination, filtering, and search
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of results per page
 * @param {number} options.page - Current page
 * @param {string} options.sortBy - Sort option in the format: sortField:(desc|asc)
 * @param {string} options.orderBy - Sort order (desc|asc)
 * @param {string} options.search - Search text for title
 * @param {string} options.categoryId - Filter by category ID
 * @param {Date} options.createdAtFrom - Filter by minimum creation date
 * @param {Date} options.createdAtTo - Filter by maximum creation date
 * @param {boolean} options.featured - Filter by featured status
 * @param {string} options.status - Filter by blog status
 * @returns {Promise<{ blogs: Array<{id: string, title: string, author: object, category: object, date: Date, status: string, views: number}>, page: number, limit: number, totalPages: number, totalResults: number }>}
 */
export const getBlogs = async (options: {
  limit?: number;
  page?: number;
  sortBy?: string;
  orderBy?: string;
  search?: string;
  categoryId?: string;
  createdAtFrom?: Date;
  createdAtTo?: Date;
  featured?: boolean;
  status?: string;
}): Promise<{
  blogs: Array<{
    id: string;
    title: string;
    author: { id: string; name: string; email: string };
    category: { id: string; name: string; slug: string };
    date: Date;
    status: string;
    views: number;
    coverImage: string;
    featured: boolean;
  }>;
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}> => {
  const {
    limit = 10,
    page = 1,
    sortBy = 'createdAt',
    orderBy = 'desc',
    search,
    categoryId,
    createdAtFrom,
    createdAtTo,
    featured,
    status,
  } = options;

  const filter: Record<string, any> = {};

  // Apply search filter (case-insensitive search in title)
  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }

  // Apply category filter
  if (categoryId) {
    filter.category = new mongoose.Types.ObjectId(categoryId);
  }

  // Apply date range filters
  if (createdAtFrom || createdAtTo) {
    filter.createdAt = {};
    if (createdAtFrom) {
      filter.createdAt.$gte = createdAtFrom;
    }
    if (createdAtTo) {
      filter.createdAt.$lte = createdAtTo;
    }
  }

  // Apply featured filter
  if (featured !== undefined) {
    filter.featured = featured;
  }

  // Apply status filter, but ignore if status is 'all'
  if (status && status !== 'all') {
    filter.status = status;
  }

  // Handle both combined sortBy format (field:order) and separate orderBy parameter
  let sortField = sortBy;
  let sortOrder: 'asc' | 'desc' = orderBy === 'desc' ? 'desc' : 'asc';

  // Check if sortBy contains the order information
  if (sortBy && sortBy.includes(':')) {
    const parts = sortBy.split(':');
    sortField = parts[0];
    sortOrder = parts[1] === 'desc' ? 'desc' : 'asc';
  }

  const sort: { [key: string]: 'asc' | 'desc' } = {};
  sort[sortField] = sortOrder;

  const skip = (page - 1) * limit;

  const blogsData = await Blog.find(filter)
    .populate('category', 'name slug')
    .populate('author', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  // Transform the blogs to include only the required fields
  const blogs = blogsData.map(blog => {
    // Create default objects for author and category if they aren't populated
    const authorData = blog.author
      ? {
          id: (blog.author as any)._id.toString(),
          name: (blog.author as any).name || 'Unknown',
          email: (blog.author as any).email || '',
        }
      : {
          id: '',
          name: 'Unknown',
          email: '',
        };

    const categoryData = blog.category
      ? {
          id: (blog.category as any)._id.toString(),
          name: (blog.category as any).name || 'Uncategorized',
          slug: (blog.category as any).slug || '',
        }
      : {
          id: '',
          name: 'Uncategorized',
          slug: '',
        };

    return {
      id: blog.id,
      title: blog.title,
      author: authorData,
      category: categoryData,
      date: blog.createdAt,
      status: blog.status,
      views: blog.views,
      coverImage: blog.coverImage || '',
      featured: blog.featured || false,
    };
  });

  const totalResults = await Blog.countDocuments(filter);
  const totalPages = Math.ceil(totalResults / limit);

  return {
    blogs,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

/**
 * Get blog by id
 * @param {string} id
 * @returns {Promise<IBlogDocument>}
 */
export const getBlogById = async (id: string): Promise<IBlogDocument> => {
  const blog = await Blog.findById(id)
    .populate('category', 'name slug')
    .populate('author', 'name email');

  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog not found');
  }
  return blog;
};

/**
 * Update blog by id
 * @param {string} blogId
 * @param {Partial<IBlog>} updateBody
 * @returns {Promise<IBlogDocument>}
 */
export const updateBlogById = async (
  blogId: string,
  updateBody: Partial<IBlog>,
): Promise<IBlogDocument> => {
  const blog = await getBlogById(blogId);
  const originalCategory = blog.category;

  Object.assign(blog, updateBody);
  await blog.save();

  // Update category post counts if the category has changed
  if (updateBody.category && updateBody.category.toString() !== originalCategory.toString()) {
    // Decrement the original category's post count
    await Category.findByIdAndUpdate(originalCategory, { $inc: { postCount: -1 } });

    // Increment the new category's post count
    await Category.findByIdAndUpdate(updateBody.category, { $inc: { postCount: 1 } });
  }

  return blog;
};

/**
 * Delete blog by id
 * @param {string} blogId
 * @returns {Promise<IBlogDocument>}
 */
export const deleteBlogById = async (blogId: string): Promise<IBlogDocument> => {
  const blog = await getBlogById(blogId);

  // Decrement the post count for the category
  if (blog.category) {
    await Category.findByIdAndUpdate(blog.category, { $inc: { postCount: -1 } });
  }

  await blog.deleteOne();
  return blog;
};
