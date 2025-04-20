import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser, IUserDocument, IUserModel } from '../interfaces/user.interface';

const userSchema = new mongoose.Schema<IUserDocument, IUserModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => {
          return /^\S+@\S+\.\S+$/.test(value);
        },
        message: 'Invalid email format',
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate: {
        validator: (value: string) => {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
        },
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
      },
      private: true, // Used by the toJSON plugin
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  },
);

// Add plugin to convert mongoose schema to json
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (
  email: string,
  excludeUserId?: string,
): Promise<boolean> {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password - The password to check
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password: string): Promise<boolean> {
  const user = this as IUserDocument;
  return bcrypt.compare(password, user.password);
};

// Hash password before saving
userSchema.pre('save', async function (next) {
  const user = this as IUserDocument;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

const User = mongoose.model<IUserDocument, IUserModel>('User', userSchema);

export default User;
