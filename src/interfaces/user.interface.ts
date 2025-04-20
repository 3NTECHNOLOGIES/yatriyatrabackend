import { Document, Model } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  isEmailVerified: boolean;
}

export interface IUserDocument extends IUser, Document {
  isPasswordMatch(password: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUserDocument> {
  isEmailTaken(email: string, excludeUserId?: string): Promise<boolean>;
}

export interface IUserWithTokens {
  user: Omit<IUser, "password">;
  tokens: {
    access: {
      token: string;
      expires: Date;
    };
    refresh: {
      token: string;
      expires: Date;
    };
  };
}

export interface ISession {
  userId: string;
  token: string;
  expires: Date;
  createdAt: Date;
}
