import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'praktikuy_super_secret_key_123';

export const register = async (req, res) => {
  try {
    const { name, email, password, wallet, role } = req.body;
    
    // Check if user already exists by email
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email sudah terdaftar.' });
    }

    // Handle wallet: convert empty string to null
    const finalWallet = wallet && wallet.trim() !== "" ? wallet.trim() : null;

    // If wallet is provided, check if it's already used
    if (finalWallet) {
      const existingWallet = await prisma.user.findUnique({ where: { wallet: finalWallet } });
      if (existingWallet) {
        return res.status(400).json({ message: 'Wallet address sudah terdaftar pada akun lain.' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        wallet: finalWallet,
        role: role || "MAHASISWA" // Default to MAHASISWA if not provided
      },
    });

    res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // identifier can be email or wallet
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { wallet: identifier }
        ]
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, wallet: user.wallet, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        wallet: user.wallet,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
