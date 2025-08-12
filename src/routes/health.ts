import { Router } from 'express';
import { HealthController } from '../controllers';

const router = Router();

// Using the arrow function property which maintains the correct 'this' context
router.get('/', HealthController.healthCheck);

export default router;