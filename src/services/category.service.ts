import { ICategory, ICategoryDocument } from '../interfaces/category.interface';
import Category from '../models/category.model';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';

/**
 * Create a category
 * @param {ICategory} categoryBody
 * @returns {Promise<ICategory>}
 */
export const createCategory = async (categoryBody: ICategory): Promise<ICategory> => {
  if (await Category.isSlugTaken(categoryBody.slug)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slug already taken');
  }

  const category = await Category.create(categoryBody);
  return category;
};

/**
 * Get all categories with pagination
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of results per page
 * @param {number} options.page - Current page
 * @param {string} options.sortBy - Sort option in the format: sortField:(desc|asc)
 * @param {string} options.search - Search text for category name
 * @returns {Promise<{ categories: ICategoryDocument[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
export const getCategories = async (options: {
  limit?: number;
  page?: number;
  sortBy?: string;
  search?: string;
}): Promise<{
  categories: ICategoryDocument[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}> => {
  const { limit = 10, page = 1, sortBy = 'name:asc', search } = options;

  const filter: Record<string, any> = {};

  // Apply search filter if provided (case-insensitive search in name)
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  const [sortField, sortOrder] = sortBy.split(':');
  const sort: { [key: string]: 'asc' | 'desc' } = {};
  sort[sortField] = sortOrder === 'desc' ? 'desc' : 'asc';

  const skip = (page - 1) * limit;

  const categories = await Category.find(filter).sort(sort).skip(skip).limit(limit);

  const totalResults = await Category.countDocuments(filter);
  const totalPages = Math.ceil(totalResults / limit);

  return {
    categories,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

/**
 * Get category by id
 * @param {string} id
 * @returns {Promise<ICategoryDocument>}
 */
export const getCategoryById = async (id: string): Promise<ICategoryDocument> => {
  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  return category;
};

/**
 * Update category by id
 * @param {string} categoryId
 * @param {Partial<ICategory>} updateBody
 * @returns {Promise<ICategory>}
 */
export const updateCategoryById = async (
  categoryId: string,
  updateBody: Partial<ICategory>,
): Promise<ICategory> => {
  const category = await getCategoryById(categoryId);

  if (updateBody.slug && (await Category.isSlugTaken(updateBody.slug, categoryId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slug already taken');
  }

  Object.assign(category, updateBody);
  await category.save();
  return category;
};

/**
 * Delete category by id
 * @param {string} categoryId
 * @returns {Promise<ICategory>}
 */
export const deleteCategoryById = async (categoryId: string): Promise<ICategory> => {
  const category = await getCategoryById(categoryId);
  await category.deleteOne();
  return category;
};
