// config/vars.ts

import dotenv from 'dotenv';
const defaults = require('./default');

dotenv.config();

if (!process.env.DATABASE) {
  throw new Error('DATABASE environment variable is not defined.');
}

if (!process.env.DATABASE_PASSWORD) {
  throw new Error('DATABASE_PASSWORD environment variable is not defined.');
}

export const vars = {
  nodeEnv: process.env.NODE_ENV || defaults.nodeEnv,
  port: process.env.PORT || defaults.port,
  databaseURL: process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD),
  jwtSecret: process.env.JWT_SECRET!, 
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || defaults.jwtExpiresIn,
  jwtCookieExpiresIn: process.env.JWT_COOKIE_EXPIRES_IN ? parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) : defaults.jwtCookieExpiresIn,
  emailUsername: process.env.EMAIL_USERNAME!, 
  emailPassword: process.env.EMAIL_PASSWORD!,
  emailHost: process.env.EMAIL_HOST!, 
  emailPort: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : defaults.emailPort,
};