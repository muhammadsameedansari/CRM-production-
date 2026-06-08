import { hasPermission } from '../config/roles.js';

export const authorize = (...permissions) => {
  return (req, res, next) => {
    const allowed = permissions.some((p) => hasPermission(req.user.role, p));
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
    }
    next();
  };
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const validate = (validations) => {
  return async (req, res, next) => {
    const { validationResult } = await import('express-validator');
    await Promise.all(validations.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  };
};
