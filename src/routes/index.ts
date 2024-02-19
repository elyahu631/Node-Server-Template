// routes/index.ts

import express from 'express';
import userRouter from './userRoutes';

const router = express.Router();

router.use('/users', userRouter);

export default router;
