import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all practicums
export const getPracticums = async (req, res) => {
  try {
    const practicums = await prisma.practicum.findMany();
    res.json(practicums);
  } catch (error) {
    console.error('Error fetching practicums:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single practicum by ID
export const getPracticumById = async (req, res) => {
  try {
    const { id } = req.params;
    const practicum = await prisma.practicum.findUnique({
      where: { id: parseInt(id) },
      include: {
        moduls: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!practicum) {
      return res.status(404).json({ message: 'Practicum not found' });
    }

    res.json(practicum);
  } catch (error) {
    console.error('Error fetching practicum:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Validate token to unlock practicum
export const unlockPracticum = async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.body;

    const practicumId = parseInt(id);

    // Find the token
    const tokenRecord = await prisma.token.findUnique({
      where: { code: token }
    });

    if (!tokenRecord) {
      return res.status(404).json({ message: 'Token tidak valid.' });
    }

    if (tokenRecord.practicumId !== practicumId) {
      return res.status(400).json({ message: 'Token ini bukan untuk praktikum ini.' });
    }

    if (tokenRecord.isUsed) {
      return res.status(400).json({ message: 'Token sudah pernah digunakan.' });
    }

    // Mark as used
    await prisma.token.update({
      where: { id: tokenRecord.id },
      data: { isUsed: true }
    });

    res.json({ message: 'Akses praktikum berhasil dibuka!' });
  } catch (error) {
    console.error('Error unlocking practicum:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create practicum (Admin only)
export const createPracticum = async (req, res) => {
  try {
    const { title, code, description, instructor, status, color, iconType } = req.body;

    const practicum = await prisma.practicum.create({
      data: { title, code, description, instructor, status: status || 'Aktif', color, iconType }
    });

    res.status(201).json({ message: 'Kelas praktikum berhasil dibuat.', practicum });
  } catch (error) {
    console.error('Error creating practicum:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Kode kelas sudah digunakan.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update practicum (Admin only)
export const updatePracticum = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, instructor, status, color, iconType } = req.body;

    const practicum = await prisma.practicum.update({
      where: { id: parseInt(id) },
      data: { title, description, instructor, status, color, iconType }
    });

    res.json({ message: 'Kelas praktikum berhasil diperbarui.', practicum });
  } catch (error) {
    console.error('Error updating practicum:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Kelas tidak ditemukan.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete practicum (Admin only)
export const deletePracticum = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete related tokens first
    await prisma.token.deleteMany({ where: { practicumId: parseInt(id) } });

    await prisma.practicum.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Kelas praktikum berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting practicum:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Kelas tidak ditemukan.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
