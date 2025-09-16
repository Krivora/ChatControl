// src/middlewares/validate.js
import { ApiError } from '../utils/ApiError.js';

export const validate = (schema, property = 'body') => (req, _res, next) => {
  try {
    schema.parse(req[property]); // valida body, query o params
    next();
  } catch (err) {
    const issues = err.errors?.map(e => ({
      path: e.path,
      message: e.message,
    }));
    next(new ApiError(400, 'Datos inválidos', issues));
  }
};
