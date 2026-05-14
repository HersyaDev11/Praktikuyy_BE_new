import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Get all tokens (Admin only), optionally filtered by practicumId
export const getTokens = async (req, res) => {
  try {
    const { practicumId } = req.query;
    const where = practicumId ? { practicumId: parseInt(practicumId) } : {};

    const tokens = await prisma.token.findMany({
      where,
      include: { practicum: { select: { id: true, title: true, code: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tokens);
  } catch (error) {
    console.error('Error fetching tokens:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Generate new token(s) for a practicum (Admin only)
export const generateTokens = async (req, res) => {
  try {
    const { practicumId, count } = req.body;
    const amount = Math.min(parseInt(count) || 1, 50); // max 50 at once

    const practicum = await prisma.practicum.findUnique({ where: { id: parseInt(practicumId) } });
    if (!practicum) {
      return res.status(404).json({ message: 'Kelas praktikum tidak ditemukan.' });
    }

    const generatedTokens = [];
    for (let i = 0; i < amount; i++) {
      const code = `PKY-${practicum.code}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      const newToken = await prisma.token.create({
        data: { code, practicumId: parseInt(practicumId) }
      });
      generatedTokens.push(newToken);
    }

    res.status(201).json({
      message: `${amount} token berhasil digenerate untuk kelas ${practicum.title}.`,
      tokens: generatedTokens
    });
  } catch (error) {
    console.error('Error generating tokens:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a token (Admin only)
export const deleteToken = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.token.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Token berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting token:', error);
    if (error.code === 'P2025') return res.status(404).json({ message: 'Token tidak ditemukan.' });
    res.status(500).json({ message: 'Internal server error' });
  }
};
