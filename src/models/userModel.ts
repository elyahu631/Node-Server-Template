// models/userModel.ts

import crypto from 'crypto';
import mongoose, { Document, Schema, Query } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

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

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Pre-save middleware to hash the password
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// Pre-save middleware to update the passwordChangedAt timestamp
userSchema.pre<IUser>('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

// Pre-find middleware to exclude inactive users from queries
userSchema.pre<Query<any, IUser>>(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

// Method to compare candidate password with user password
userSchema.methods.correctPassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  // Use 'this.password' to access the hashed password stored in the user instance
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt((this.passwordChangedAt.getTime() / 1000).toString(), 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Method to generate password reset token
userSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
