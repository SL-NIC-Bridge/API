import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '../utils/errors';

export interface ValidationSchema {
  body?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
}

export const validate = (schema: ValidationSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const validationErrors: string[] = [];

    // Validate request body
    if (schema.body) {
      const { error } = schema.body.validate(req.body, { abortEarly: false });
      if (error) {
        validationErrors.push(...error.details.map(detail => detail.message));
      }
    }

    // Validate request parameters
    if (schema.params) {
      const { error } = schema.params.validate(req.params, { abortEarly: false });
      if (error) {
        validationErrors.push(...error.details.map(detail => detail.message));
      }
    }

    // Validate query parameters
    if (schema.query) {
      const { error } = schema.query.validate(req.query, { abortEarly: false });
      if (error) {
        validationErrors.push(...error.details.map(detail => detail.message));
      }
    }

    // If there are validation errors, return them
    if (validationErrors.length > 0) {
      const error = new ValidationError('Validation failed', validationErrors.join(', '));
      return next(error);
    }

    next();
  };
}; 