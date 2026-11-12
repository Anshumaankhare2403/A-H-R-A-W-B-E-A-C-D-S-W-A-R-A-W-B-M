import { validateTelemetryPayload } from '../utils/validators.js';

export function validateTelemetryBody(req, res, next) {
  const result = validateTelemetryPayload(req.body);
  if (!result.valid) {
    return res.status(400).json({
      success: false,
      error: {
        message: result.error,
        statusCode: 400,
        timestamp: new Date().toISOString()
      }
    });
  }
  req.sanitizedTelemetry = result.sanitized;
  next();
}

export function validatePagination(req, res, next) {
  let { page = 1, limit = 20 } = req.query;
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  req.pagination = {
    page: isNaN(page) || page < 1 ? 1 : page,
    limit: isNaN(limit) || limit < 1 || limit > 100 ? 20 : limit
  };

  next();
}

export default {
  validateTelemetryBody,
  validatePagination
};

