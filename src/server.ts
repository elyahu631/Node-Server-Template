// server.ts

import { connectDB } from './dataBase/db';
import { vars } from './config/vars';

const { port, databaseURL } = vars;

// Handling uncaught exceptions at the top level
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err);
  process.exit(1); // Exit process immediately
});

// Assuming 'app' is an Express application. You might need to adjust the import based on your setup
import app from './app';

connectDB(databaseURL);

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
