import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Koneksi ke provider (Node Blockchain)
const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);

// Setup dompet (Wallet) dari Private Key untuk menandatangani transaksi
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// ABI sederhana untuk Smart Contract Sertifikat NFT Praktikuy
// Anggap kita punya fungsi mint(address to, string memory courseName, string memory grade)
const contractABI = [
  "function mintCertificate(address student, string courseName, string grade) public returns (uint256)",
  "event CertificateMinted(address indexed student, uint256 tokenId, string courseName, string grade)"
];

const contractAddress = process.env.CONTRACT_ADDRESS;

// Instance Contract
const praktikuyContract = new ethers.Contract(contractAddress, contractABI, wallet);

/**
 * Fungsi untuk memanggil Smart Contract dan mencetak NFT kelulusan
 * @param {string} studentAddress - Alamat dompet wallet siswa
 * @param {string} courseName - Nama kelas yang diluluskan
 * @param {string} grade - Nilai huruf (contoh: "A")
 * @returns {Promise<Object>} Data transaksi dan token ID
 */
export const mintNftCertificate = async (studentAddress, courseName, grade) => {
  try {
    console.log(`Memulai proses minting ke blockchain untuk ${studentAddress}...`);
    
    // Panggil fungsi smart contract
    const tx = await praktikuyContract.mintCertificate(studentAddress, courseName, grade);
    
    // Tunggu sampai transaksi masuk ke dalam blok (confirmed)
    const receipt = await tx.wait();
    console.log(`Transaksi berhasil di-mining! Hash: ${receipt.hash}`);

    return {
      success: true,
      txHash: receipt.hash,
    };
  } catch (error) {
    console.error("Gagal melakukan minting NFT:", error);
    return {
      success: false,
      error: error.message
    };
  }
};
