// src/app.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import { vars } from './config/vars';
import AppError from './utils/appError';
import globalErrorHandler from './middlewares/errorMiddleware';
import allRoutes from './routes/index';

const app = express();
app.use(cors());

// 1) GLOBAL MIDDLEWARES

// Set security HTTP headers using the Helmet middleware
app.use(helmet());

// Development logging using morgan
if (vars.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from the same API using express-rate-limit middleware
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, 
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body with a limit of 10kb
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection using express-mongo-sanitize middleware
app.use(mongoSanitize());

// Data sanitization against cross-site scripting (XSS) attacks using xss-clean middleware
// app.use(xss());

// Prevent parameter pollution using hpp middleware with a whitelist of allowed parameters
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Test middleware to add a timestamp to the request object
app.use((req: Request, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Loading the models for the application.
import loadModels from './middlewares/modelLoader';
loadModels();

// 2) ROUTES
app.use('/api/v1', allRoutes);

// 3) HANDLE UNHANDLED ROUTES
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

export default app;
