import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const practicumClasses = [
  {
    title: "Praktikum Fisika Dasar",
    code: "FSK101",
    description: "Mempelajari hukum-hukum dasar fisika melalui simulasi virtual dan analisis data terdesentralisasi.",
    instructor: "Dr. Albert Einstone",
    studentsCount: 124,
    status: "Aktif",
    iconType: "physics",
    color: "from-blue-500 to-cyan-400",
  },
  {
    title: "Praktikum Smart Contract",
    code: "BLK302",
    description: "Pengembangan dan audit Smart Contract di jaringan Ethereum menggunakan bahasa Solidity.",
    instructor: "Prof. Satoshi Nakamoto",
    studentsCount: 89,
    status: "Aktif",
    iconType: "blockchain",
    color: "from-indigo-500 to-purple-500",
  },
  {
    title: "Praktikum Keamanan Siber",
    code: "CYB401",
    description: "Simulasi serangan dan pertahanan jaringan menggunakan metodologi enkripsi modern.",
    instructor: "Mr. Elliot Alderson",
    studentsCount: 210,
    status: "Selesai",
    iconType: "cyber",
    color: "from-red-500 to-orange-400",
  },
  {
    title: "Praktikum Jaringan Komputer",
    code: "NET205",
    description: "Konfigurasi routing, switching, dan manajemen topologi jaringan terdistribusi.",
    instructor: "Ir. Linus Torvalds",
    studentsCount: 156,
    status: "Aktif",
    iconType: "network",
    color: "from-green-500 to-emerald-400",
  },
  {
    title: "Praktikum Algoritma & Struktur Data",
    code: "ALG102",
    description: "Implementasi logika pemecahan masalah dengan evaluasi runtime dan memori secara real-time.",
    instructor: "Dr. Ada Lovelace",
    studentsCount: 320,
    status: "Aktif",
    iconType: "algorithm",
    color: "from-yellow-500 to-amber-400",
  },
  {
    title: "Praktikum IoT & Embedded Systems",
    code: "IOT304",
    description: "Desain sistem perangkat keras terhubung dengan pemantauan sensor berbasis cloud dan blockchain.",
    instructor: "Mr. Nikola Tesla",
    studentsCount: 112,
    status: "Pendaftaran",
    iconType: "iot",
    color: "from-teal-500 to-cyan-500",
  },
];

async function main() {
  console.log(`Start seeding ...`);
  for (const p of practicumClasses) {
    const practicum = await prisma.practicum.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
    console.log(`Created practicum with id: ${practicum.id}`);

    // Create a dummy token for this practicum
    // Format: PKY-[CODE]-1234
    const tokenCode = `PKY-${p.code}-1234`;
    await prisma.token.upsert({
      where: { code: tokenCode },
      update: {},
      create: {
        code: tokenCode,
        practicumId: practicum.id,
      }
    });
    console.log(`Created dummy token for ${p.code}: ${tokenCode}`);
  }

  // Create Default Users for Testing
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash("password123", salt);

  const defaultUsers = [
    { name: "Administrator", email: "admin@gmail.com", role: "ADMIN", wallet: "0xAdminWallet" },
    { name: "Bapak Dosen", email: "dosen@gmail.com", role: "DOSEN", wallet: "0xDosenWallet" },
    { name: "Mahasiswa Rajin", email: "mhs@gmail.com", role: "MAHASISWA", wallet: "0xMhsWallet" }
  ];

  for (const u of defaultUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        password,
        role: u.role,
        wallet: u.wallet
      }
    });
    console.log(`Created default user: ${u.email} (${u.role})`);
  }

  console.log(`Seeding finished. Buka database untuk melihat data token dan user.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
