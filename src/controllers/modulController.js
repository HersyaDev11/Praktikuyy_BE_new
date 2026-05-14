import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all moduls for a practicum
export const getModuls = async (req, res) => {
  try {
    const { practicumId } = req.params;
    const moduls = await prisma.modul.findMany({
      where: { practicumId: parseInt(practicumId) },
      orderBy: { order: 'asc' }
    });
    res.json(moduls);
  } catch (error) {
    console.error('Error fetching moduls:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create modul (Dosen/Admin)
export const createModul = async (req, res) => {
  try {
    const { practicumId } = req.params;
    const { title, content, order } = req.body;

    const modul = await prisma.modul.create({
      data: {
        title,
        content,
        order: order || 1,
        practicumId: parseInt(practicumId)
      }
    });

    res.status(201).json({ message: 'Modul berhasil ditambahkan.', modul });
  } catch (error) {
    console.error('Error creating modul:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update modul (Dosen/Admin)
export const updateModul = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, order } = req.body;

    const modul = await prisma.modul.update({
      where: { id: parseInt(id) },
      data: { title, content, order }
    });

    res.json({ message: 'Modul berhasil diperbarui.', modul });
  } catch (error) {
    console.error('Error updating modul:', error);
    if (error.code === 'P2025') return res.status(404).json({ message: 'Modul tidak ditemukan.' });
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete modul (Dosen/Admin)
export const deleteModul = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.modul.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Modul berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting modul:', error);
    if (error.code === 'P2025') return res.status(404).json({ message: 'Modul tidak ditemukan.' });
    res.status(500).json({ message: 'Internal server error' });
  }
};
