import express from 'express';
import { getPracticums, getPracticumById, unlockPracticum, createPracticum, updatePracticum, deletePracticum } from '../controllers/practicumController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getPracticums);
router.get('/:id', getPracticumById);
router.post('/:id/unlock', unlockPracticum);

// Admin-only routes
router.post('/', verifyToken, authorizeRoles('ADMIN'), createPracticum);
router.put('/:id', verifyToken, authorizeRoles('ADMIN'), updatePracticum);
router.delete('/:id', verifyToken, authorizeRoles('ADMIN'), deletePracticum);

export default router;
