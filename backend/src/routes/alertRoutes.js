import express from 'express';
import { getAlerts, acknowledgeAlert } from '../controllers/alertController.js';
import { validatePagination } from '../middleware/validation.js';

const router = express.Router();

router.get('/', validatePagination, getAlerts);
router.patch('/:id/acknowledge', acknowledgeAlert);

export default router;

