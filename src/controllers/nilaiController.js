import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all nilai for a practicum (Dosen sees all, Mahasiswa sees own)
export const getNilai = async (req, res) => {
  try {
    const { practicumId } = req.params;
    const where = { practicumId: parseInt(practicumId) };

    // If the requester is a Mahasiswa, only show their own
    if (req.user.role === 'MAHASISWA') {
      where.userId = req.user.id;
    }

    const nilaiList = await prisma.nilai.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(nilaiList);
  } catch (error) {
    console.error('Error fetching nilai:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Input nilai (Dosen/Admin only)
export const createNilai = async (req, res) => {
  try {
    const { practicumId } = req.params;
    const { userId, score, category, notes } = req.body;

    const nilai = await prisma.nilai.create({
      data: {
        score: parseFloat(score),
        category,
        notes,
        practicumId: parseInt(practicumId),
        userId: parseInt(userId)
      },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    res.status(201).json({ message: `Nilai ${category} berhasil diinput.`, nilai });
  } catch (error) {
    console.error('Error creating nilai:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete nilai (Dosen/Admin only)
export const deleteNilai = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.nilai.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Nilai berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting nilai:', error);
    if (error.code === 'P2025') return res.status(404).json({ message: 'Nilai tidak ditemukan.' });
    res.status(500).json({ message: 'Internal server error' });
  }
};
