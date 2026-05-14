import express from 'express';
import { PrismaClient } from '@prisma/client';
import { mintNftCertificate } from '../blockchain/ethersProvider.js';
import authRoutes from './authRoutes.js';
import practicumRoutes from './practicumRoutes.js';
import userRoutes from './userRoutes.js';
import dosenRoutes from './dosenRoutes.js';
import tokenRoutes from './tokenRoutes.js';
import enrollmentRoutes from './enrollmentRoutes.js';

const router = express.Router();
const prisma = new PrismaClient();

// Mount routes
router.use('/auth', authRoutes);
router.use('/practicums', practicumRoutes);
router.use('/users', userRoutes);
router.use('/tokens', tokenRoutes);
router.use('/', dosenRoutes); // Modul & Nilai routes
router.use('/', enrollmentRoutes); // Enrollment & Certificate routes

// Endpoint untuk simulasi kelulusan & pencetakan sertifikat (Web2 -> Web3)
router.post('/graduate', async (req, res) => {
  try {
    const { userId, courseName, grade } = req.body;

    // 1. Cek User di Database Prisma
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan di database.' });
    }
    
    if (!user.wallet) {
      return res.status(400).json({ error: 'User belum menghubungkan dompet (wallet address) mereka.' });
    }

    // 2. Integrasi Blockchain: Eksekusi transaksi ke Smart Contract
    const blockchainResult = await mintNftCertificate(user.wallet, courseName, grade);

    if (!blockchainResult.success) {
      return res.status(500).json({ error: 'Gagal mencetak NFT di jaringan Blockchain', details: blockchainResult.error });
    }

    // 3. Simpan rekam jejak ke database lokal (Prisma)
    const certificate = await prisma.certificate.create({
      data: {
        userId: user.id,
        courseName,
        grade,
        txHash: blockchainResult.txHash
      }
    });

    res.json({
      message: 'Berhasil lulus dan NFT Sertifikat telah diterbitkan!',
      certificate,
      blockchain: {
        transactionHash: blockchainResult.txHash,
        explorerUrl: `https://sepolia.etherscan.io/tx/${blockchainResult.txHash}` // Sesuaikan dengan jaringan yg dipakai
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

// Get certificates for a user (or all for admin)
import { verifyToken as verifyJwt } from '../middleware/authMiddleware.js';

router.get('/certificates', verifyJwt, async (req, res) => {
  try {
    const where = req.user.role === 'ADMIN' ? {} : { userId: req.user.id };
    const certificates = await prisma.certificate.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { issuedAt: 'desc' }
    });
    res.json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
