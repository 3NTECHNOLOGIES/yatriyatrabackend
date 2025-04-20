import httpStatus from 'http-status';
import User from '../models/user.model';
import ApiError from '../utils/ApiError';

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<IUserDocument>}
 */
const createUser = async (userBody: {
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
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<IUserDocument>}
 */
const getUserById = async (id: string) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<IUserDocument>}
 */
const getUserByEmail = async (email: string) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<IUserDocument>}
 */
const updateUserById = async (
  userId: string,
  updateBody: {
    name?: string;
    email?: string;
    password?: string;
  },
) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<IUserDocument>}
 */
const deleteUserById = async (userId: string) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.deleteOne();
  return user;
};

export { createUser, getUserById, getUserByEmail, updateUserById, deleteUserById };
