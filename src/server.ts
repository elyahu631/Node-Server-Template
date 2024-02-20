// server.ts

import { connectDB } from './utils/dataBase/db';
import { vars } from './config/vars';

const { port } = vars;

// Handling uncaught exceptions at the top level
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err);
  process.exit(1); // Exit process immediately
});

import app from './app';

connectDB();

// Starting the server
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Handling unhandled promise rejections (e.g., MongoDB connection issues)
process.on('unhandledRejection', (err: any) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1); // Exit process after server closes
  });
});
