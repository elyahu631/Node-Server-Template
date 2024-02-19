// routes/index.ts

import express from 'express';
import userRouter from './userRoutes';

const router = express.Router();

// Use the user router for any requests to '/users'
router.use('/users', userRouter);

export default router;
