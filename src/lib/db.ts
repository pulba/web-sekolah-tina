// lib/db.ts
import { createClient } from '@libsql/client';

// Inisialisasi client database
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:database.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Interface untuk data user
export interface UserData {
  tahun_ppdb: string;
  nama_lengkap: string;
  nama_panggilan: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  agama: string;
  nomor_hp: string;
  email: string;
  alamat_lengkap: string;
  asal_sekolah: string;
  alamat_sekolah: string;
  nama_ayah: string;
  telepon_ayah: string;
  pekerjaan_ayah: string;
  alamat_ayah: string;
  nama_ibu: string;
  telepon_ibu: string;
  pekerjaan_ibu: string;
  alamat_ibu: string;
  pernyataan_kebenaran: boolean;
  pernyataan_seleksi: boolean;
  pernyataan_keputusan: boolean;
  status?: string;
}

// Fungsi untuk cek tabel users
export async function checkUsersTable() {
  try {
    
    const result = await db.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='users'
    `);
    
    
    return {
      exists: result.rows.length > 0,
      count: result.rows.length
    };
  } catch (error) {
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Fungsi untuk insert user
export async function insertUser(userData: UserData) {
  try {
    
    // Generate unique ID
    const userId = `PPDB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Prepare data untuk insert
    const data = {
      ...userData,
      id: userId,
      status: userData.status || 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Convert boolean to integer for SQLite
      pernyataan_kebenaran: userData.pernyataan_kebenaran ? 1 : 0,
      pernyataan_seleksi: userData.pernyataan_seleksi ? 1 : 0,
      pernyataan_keputusan: userData.pernyataan_keputusan ? 1 : 0,
    };


    // SQL untuk insert
    const sql = `
      INSERT INTO users (
        id, tahun_ppdb, nama_lengkap, nama_panggilan, tempat_lahir,
        tanggal_lahir, jenis_kelamin, agama, nomor_hp, email, alamat_lengkap,
        asal_sekolah, alamat_sekolah, nama_ayah, telepon_ayah, pekerjaan_ayah,
        alamat_ayah, nama_ibu, telepon_ibu, pekerjaan_ibu, alamat_ibu,
        pernyataan_kebenaran, pernyataan_seleksi, pernyataan_keputusan, status,
        created_at, updated_at
      ) VALUES (
        :id, :tahun_ppdb, :nama_lengkap, :nama_panggilan, :tempat_lahir,
        :tanggal_lahir, :jenis_kelamin, :agama, :nomor_hp, :email, :alamat_lengkap,
        :asal_sekolah, :alamat_sekolah, :nama_ayah, :telepon_ayah, :pekerjaan_ayah,
        :alamat_ayah, :nama_ibu, :telepon_ibu, :pekerjaan_ibu, :alamat_ibu,
        :pernyataan_kebenaran, :pernyataan_seleksi, :pernyataan_keputusan, :status,
        :created_at, :updated_at
      )
    `;

    const result = await db.execute({
      sql,
      args: data
    });


    return {
      success: true,
      lastInsertRowid: userId,
      rowCount: result.rowsAffected
    };
  } catch (error: any) {
    
    return {
      success: false,
      error: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      details: error
    };
  }
}

// Fungsi untuk get user by ID
export async function getUserById(id: string) {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [id]
    });
    
    if (result.rows.length > 0) {
      return {
        success: true,
        data: result.rows[0]
      };
    } else {
      return {
        success: false,
        message: 'Data tidak ditemukan'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Fungsi untuk get all users
export async function getAllUsers() {
  try {
    const result = await db.execute('SELECT * FROM users ORDER BY created_at DESC');
    return {
      success: true,
      data: result.rows,
      count: result.rows.length
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    };
  }
}

export async function updateUserStatus(id: string, status: string) {
  try {
    const result = await db.execute({
      sql: 'UPDATE users SET status = ?, updated_at = ? WHERE id = ?',
      args: [status, new Date().toISOString(), id]
    });
    
    return {
      success: result.rowsAffected > 0,
      rowCount: result.rowsAffected
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
// Export default db juga jika diperlukan
export default db;