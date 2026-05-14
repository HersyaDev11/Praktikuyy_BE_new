import express from 'express';
import { getTokens, generateTokens, deleteToken } from '../controllers/tokenController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are Admin only
router.get('/', verifyToken, authorizeRoles('ADMIN'), getTokens);
router.post('/generate', verifyToken, authorizeRoles('ADMIN'), generateTokens);
router.delete('/:id', verifyToken, authorizeRoles('ADMIN'), deleteToken);

export default router;
