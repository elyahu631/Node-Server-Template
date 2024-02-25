
// types/user.interface.ts

import { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  photo?: string;
  role: 'user' | 'admin';
  password: string;
  passwordConfirm?: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  active: boolean;
  correctPassword(candidatePassword: string): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  createPasswordResetToken(): string;
}