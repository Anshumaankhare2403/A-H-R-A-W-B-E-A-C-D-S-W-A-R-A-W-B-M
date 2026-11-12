/**
 * Centralized error handling middleware.
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const message = err.message || 'Internal Server Error';

  console.error(`[Error Handler] ${req.method} ${req.url} - ${statusCode}: ${message}`);
  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString()
    }
  });
}

export function notFoundHandler(req, res, next) {
  const error = new Error(`Resource not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export default {
  errorHandler,
  notFoundHandler
};

