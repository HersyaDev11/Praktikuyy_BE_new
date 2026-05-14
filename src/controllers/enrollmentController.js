import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Enroll (Mahasiswa joins a practicum class)
export const enrollPracticum = async (req, res) => {
  try {
    const { practicumId } = req.params;
    const userId = req.user.id;

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: { userId_practicumId: { userId, practicumId: parseInt(practicumId) } }
    });

    if (existing) {
      return res.status(400).json({ message: 'Anda sudah terdaftar di kelas ini.' });
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId, practicumId: parseInt(practicumId) }
    });

    // Update student count
    await prisma.practicum.update({
      where: { id: parseInt(practicumId) },
      data: { studentsCount: { increment: 1 } }
    });

    res.status(201).json({ message: 'Berhasil mendaftar ke kelas praktikum!', enrollment });
  } catch (error) {
    console.error('Error enrolling:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get my enrollments (Mahasiswa)
export const getMyEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: { practicum: true },
      orderBy: { enrolledAt: 'desc' }
    });
    res.json(enrollments);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get enrolled students for a practicum (Dosen/Admin)
export const getEnrolledStudents = async (req, res) => {
  try {
    const { practicumId } = req.params;
    const enrollments = await prisma.enrollment.findMany({
      where: { practicumId: parseInt(practicumId) },
      include: { user: { select: { id: true, name: true, email: true, wallet: true } } },
      orderBy: { enrolledAt: 'desc' }
    });
    res.json(enrollments);
  } catch (error) {
    console.error('Error fetching enrolled students:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Issue certificate (Dosen/Admin) — saves to DB, blockchain mint is optional
export const issueCertificate = async (req, res) => {
  try {
    const { userId, practicumId, grade } = req.body;

    const practicum = await prisma.practicum.findUnique({ where: { id: parseInt(practicumId) } });
    if (!practicum) return res.status(404).json({ message: 'Kelas tidak ditemukan.' });

    const student = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!student) return res.status(404).json({ message: 'Mahasiswa tidak ditemukan.' });

    // Check if certificate already exists
    const existing = await prisma.certificate.findFirst({
      where: { userId: parseInt(userId), courseName: practicum.title }
    });
    if (existing) {
      return res.status(400).json({ message: 'Sertifikat untuk mahasiswa ini di kelas ini sudah pernah diterbitkan.' });
    }

    const certificate = await prisma.certificate.create({
      data: {
        userId: parseInt(userId),
        courseName: practicum.title,
        grade,
        txHash: null // Will be filled when blockchain is connected
      },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    res.status(201).json({
      message: `Sertifikat berhasil diterbitkan untuk ${student.name}!`,
      certificate
    });
  } catch (error) {
    console.error('Error issuing certificate:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
