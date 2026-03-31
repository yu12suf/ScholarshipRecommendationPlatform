import { Request } from 'express';
// @ts-ignore - express-validator v7 types issue
import { validationResult } from 'express-validator';

/**
 * Runs an array of express-validator validations on the request.
 * If validation fails, it throws an error with the validation errors.
 * @param req - Express request object
 * @param validations - Array of express-validator validations
 */
export async function validateRequest(req: Request, validations: any[]) {
  // Run all validations
  await Promise.all(validations.map(validation => validation.run(req)));

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    (error as any).status = 400;
    (error as any).errors = errors.array();
    throw error;
  }
}
