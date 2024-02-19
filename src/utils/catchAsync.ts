// /utils/catchAsync.ts

import { Request, Response, NextFunction } from 'express';

// Define a type for the asynchronous route handler functions
type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

const catchAsync = (fn: AsyncRouteHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
