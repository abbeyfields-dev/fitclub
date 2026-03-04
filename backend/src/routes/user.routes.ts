import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { UserController } from '../controllers/user.controller';

const router = Router();

router.post('/users/me/push-token', authenticate, UserController.registerPushToken);

export default router;
