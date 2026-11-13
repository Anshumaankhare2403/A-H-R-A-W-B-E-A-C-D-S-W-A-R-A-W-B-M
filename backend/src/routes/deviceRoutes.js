import { Router } from 'express';
import {
  getDevices,
  getDeviceById,
  getLatestDeviceTelemetry
} from '../controllers/deviceController.js';

const router = Router();

router.get('/', getDevices);
router.get('/:deviceId', getDeviceById);
router.get('/:deviceId/latest', getLatestDeviceTelemetry);

export default router;
