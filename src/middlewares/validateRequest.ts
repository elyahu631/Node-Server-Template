// validations/validateRequest.ts

import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

// Middleware for validating request data with a zod schema
const validateRequest = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  if (!schema) {
    throw new Error('Validation schema is undefined');
  }

  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errorMessage = result.error.errors.map(error => `${error.path.join('.')}: ${error.message}`).join(', ');
    return res.status(400).json({ error: errorMessage });
  }
  next();
};

export default validateRequest;
