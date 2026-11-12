import express from 'express';
import { getTelemetry, getDeviceTelemetry, createTelemetry } from '../controllers/telemetryController.js';
import { validatePagination, validateTelemetryBody } from '../middleware/validation.js';

const router = express.Router();

router.get('/', validatePagination, getTelemetry);
router.get('/:deviceId', validatePagination, getDeviceTelemetry);
router.post('/', validateTelemetryBody, createTelemetry);

export default router;

