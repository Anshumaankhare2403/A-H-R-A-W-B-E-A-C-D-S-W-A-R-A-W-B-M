import { Router } from 'express';
import {
  getTelemetry,
  getTelemetryByDeviceId,
  createTelemetry
} from '../controllers/telemetryController.js';

const router = Router();

router.get('/', getTelemetry);
router.post('/', createTelemetry);
router.get('/:deviceId', getTelemetryByDeviceId);

export default router;
