import httpStatus from 'http-status';
import User from '../models/user.model';
import ApiError from '../utils/ApiError';
import { IUser, IUserDocument } from '../interfaces/user.interface';
import mongoose from 'mongoose';

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<IUserDocument>}
 */
export const createUser = async (userBody: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Get all users with pagination, search and filtering
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of results per page
 * @param {number} options.page - Current page
 * @param {string} options.sortBy - Sort option in the format: sortField:(desc|asc)
 * @param {string} options.search - Search text for name or email
 * @param {string} options.role - Filter by role (admin or user)
 * @param {string} options.status - Filter by status (active or inactive)
 * @returns {Promise<{ users: IUserDocument[], page: number, limit: number, totalPages: number, totalResults: number }>}
 */
export const getUsers = async (options: {
  limit?: number;
  page?: number;
  sortBy?: string;
  search?: string;
  role?: string;
  status?: string;
}): Promise<{
  users: IUserDocument[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}> => {
  const { limit = 10, page = 1, sortBy = 'createdAt:desc', search, role, status } = options;

  const filter: Record<string, any> = {};

  // Apply search filter (case-insensitive search in name or email)
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  // Apply role filter
  if (role) {
    filter.role = role;
  }

  // Apply status filter
  if (status) {
    filter.status = status;
  }

  const [sortField, sortOrder] = sortBy.split(':');
  const sort: { [key: string]: 'asc' | 'desc' } = {};
  sort[sortField] = sortOrder === 'desc' ? 'desc' : 'asc';

  const skip = (page - 1) * limit;

  const users = await User.find(filter).sort(sort).skip(skip).limit(limit);

  const totalResults = await User.countDocuments(filter);
  const totalPages = Math.ceil(totalResults / limit);

  return {
    users,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

/**
 * Get user by id
 * @param {string} id
 * @returns {Promise<IUserDocument>}
 */
export const getUserById = async (id: string): Promise<IUserDocument> => {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user;
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<IUserDocument>}
 */
export const getUserByEmail = async (email: string) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {string} userId
 * @param {Partial<IUser>} updateBody
 * @returns {Promise<IUserDocument>}
 */
export const updateUserById = async (
  userId: string,
  updateBody: Partial<IUser>,
): Promise<IUserDocument> => {
  const user = await getUserById(userId);

  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  // Cannot directly modify password through this endpoint
  if (updateBody.password) {
    delete updateBody.password;
  }

  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {string} userId
 * @returns {Promise<IUserDocument>}
 */
export const deleteUserById = async (userId: string): Promise<IUserDocument> => {
  const user = await getUserById(userId);
  await user.deleteOne();
  return user;
};
