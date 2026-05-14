import express from 'express';
import { enrollPracticum, getMyEnrollments, getEnrolledStudents, issueCertificate } from '../controllers/enrollmentController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Mahasiswa: enroll & see my enrollments
router.post('/practicums/:practicumId/enroll', verifyToken, authorizeRoles('MAHASISWA'), enrollPracticum);
router.get('/my-enrollments', verifyToken, authorizeRoles('MAHASISWA'), getMyEnrollments);

// Dosen/Admin: see enrolled students for a class
router.get('/practicums/:practicumId/students', verifyToken, authorizeRoles('DOSEN', 'ADMIN'), getEnrolledStudents);

// Dosen/Admin: issue certificate
router.post('/certificates/issue', verifyToken, authorizeRoles('DOSEN', 'ADMIN'), issueCertificate);

export default router;
