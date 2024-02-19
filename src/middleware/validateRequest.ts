// validations/validateRequest.ts

import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi'; 

// Middleware for validating request data with a Joi schema
const validateRequest = (schema: Schema) => (req: Request, res: Response, next: NextFunction) => {
  if (!schema) {
    throw new Error('Validation schema is undefined');
  }

  const { error } = schema.validate(req.body);
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return res.status(400).json({ error: errorMessage });
  }
  next();
};

export default validateRequest;
