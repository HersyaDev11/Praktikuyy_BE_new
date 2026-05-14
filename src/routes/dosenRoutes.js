import express from 'express';
import { getModuls, createModul, updateModul, deleteModul } from '../controllers/modulController.js';
import { getNilai, createNilai, deleteNilai } from '../controllers/nilaiController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// ===== MODUL ROUTES =====
// Public: get moduls for a practicum
router.get('/practicums/:practicumId/moduls', getModuls);

// Dosen/Admin: CRUD modul
router.post('/practicums/:practicumId/moduls', verifyToken, authorizeRoles('DOSEN', 'ADMIN'), createModul);
router.put('/moduls/:id', verifyToken, authorizeRoles('DOSEN', 'ADMIN'), updateModul);
router.delete('/moduls/:id', verifyToken, authorizeRoles('DOSEN', 'ADMIN'), deleteModul);

// ===== NILAI ROUTES =====
// Authenticated: get nilai (Dosen sees all, Mahasiswa sees own)
router.get('/practicums/:practicumId/nilai', verifyToken, getNilai);

// Dosen/Admin: input & delete nilai
router.post('/practicums/:practicumId/nilai', verifyToken, authorizeRoles('DOSEN', 'ADMIN'), createNilai);
router.delete('/nilai/:id', verifyToken, authorizeRoles('DOSEN', 'ADMIN'), deleteNilai);

export default router;
