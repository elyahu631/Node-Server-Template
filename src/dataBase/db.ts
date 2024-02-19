// dataBase/db.ts

import mongoose from 'mongoose';

export const connectDB = async (databaseURL: string): Promise<void> => {
  try {
    await mongoose.connect(databaseURL);
    console.log('DB connection successful!');
  } catch (err) {
    console.error('DB connection failed.', err);
    process.exit(1);
  }
};
