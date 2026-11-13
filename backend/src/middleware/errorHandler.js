import config from '../config/environment.js';

export function errorHandler(err, req, res, next) {
  console.error(`[API Error] ${req.method} ${req.url}:`, err);

  const statusCode = err.status || err.statusCode || 500;
  const isDev = config.env === 'development';

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(isDev && { stack: err.stack })
  });
}

export default errorHandler;
