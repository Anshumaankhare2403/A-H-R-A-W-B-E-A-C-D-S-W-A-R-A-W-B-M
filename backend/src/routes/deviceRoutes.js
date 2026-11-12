import express from 'express';
import { getDevices, getDeviceById, getDeviceLatestTelemetry } from '../controllers/deviceController.js';
import { validatePagination } from '../middleware/validation.js';

const router = express.Router();

router.get('/', validatePagination, getDevices);
router.get('/:deviceId', getDeviceById);
router.get('/:deviceId/latest', getDeviceLatestTelemetry);

export default router;

