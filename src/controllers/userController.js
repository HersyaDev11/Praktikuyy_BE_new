import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all users (Admin only)
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        wallet: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user role (Admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['ADMIN', 'DOSEN', 'MAHASISWA'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Role tidak valid. Gunakan: ADMIN, DOSEN, atau MAHASISWA.' });
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role },
      select: { id: true, name: true, email: true, role: true }
    });

    res.json({ message: `Role berhasil diubah menjadi ${role}.`, user });
  } catch (error) {
    console.error('Error updating user role:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'User berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
