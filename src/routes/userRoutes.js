import express from 'express';
import { getUsers, updateUserRole, deleteUser } from '../controllers/userController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin & Dosen can view users list (Dosen needs it for grading/certificates)
router.get('/', verifyToken, authorizeRoles('ADMIN', 'DOSEN'), getUsers);
router.put('/:id/role', verifyToken, authorizeRoles('ADMIN'), updateUserRole);
router.delete('/:id', verifyToken, authorizeRoles('ADMIN'), deleteUser);

export default router;
