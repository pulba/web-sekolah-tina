// create-table.js (untuk Turso cloud)
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

async function createUsersTable() {
  console.log('🚀 Setting up Turso database...');
  console.log('Database URL:', process.env.TURSO_DATABASE_URL);
  
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  try {
    // 1. Cek apakah tabel sudah ada
    console.log('🔍 Checking for existing tables...');
    const tables = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table'
    `);
    
    console.log('Existing tables:', tables.rows.map(r => r.name));
    
    const usersTable = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='users'
    `);
    
    if (usersTable.rows.length > 0) {
      console.log('ℹ️  users table exists, dropping...');
      await client.execute('DROP TABLE users');
      console.log('🗑️  Old table dropped');
    }
    
    // 2. Buat tabel baru
    console.log('🔄 Creating new users table...');
    
    await client.execute(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        tahun_ppdb TEXT NOT NULL,
        nama_lengkap TEXT NOT NULL,
        nama_panggilan TEXT NOT NULL,
        tempat_lahir TEXT NOT NULL,
        tanggal_lahir TEXT NOT NULL,
        jenis_kelamin TEXT NOT NULL,
        agama TEXT NOT NULL,
        nomor_hp TEXT NOT NULL,
        email TEXT NOT NULL,
        alamat_lengkap TEXT NOT NULL,
        asal_sekolah TEXT NOT NULL,
        alamat_sekolah TEXT NOT NULL,
        nama_ayah TEXT NOT NULL,
        telepon_ayah TEXT NOT NULL,
        pekerjaan_ayah TEXT NOT NULL,
        alamat_ayah TEXT NOT NULL,
        nama_ibu TEXT NOT NULL,
        telepon_ibu TEXT NOT NULL,
        pekerjaan_ibu TEXT NOT NULL,
        alamat_ibu TEXT NOT NULL,
        pernyataan_kebenaran INTEGER NOT NULL,
        pernyataan_seleksi INTEGER NOT NULL,
        pernyataan_keputusan INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Table created successfully!');
    
    // 3. Tambah data sample
    console.log('\n📝 Adding sample data...');
    const sampleId = `sample-${Date.now()}`;
    
    await client.execute({
      sql: `
        INSERT INTO users (
          id, tahun_ppdb, nama_lengkap, nama_panggilan, tempat_lahir,
          tanggal_lahir, jenis_kelamin, agama, nomor_hp, email, alamat_lengkap,
          asal_sekolah, alamat_sekolah, nama_ayah, telepon_ayah, pekerjaan_ayah,
          alamat_ayah, nama_ibu, telepon_ibu, pekerjaan_ibu, alamat_ibu,
          pernyataan_kebenaran, pernyataan_seleksi, pernyataan_keputusan, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        sampleId, 
        '2026/2027', 
        'Budi Santoso', 
        'Budi', 
        'Jakarta',
        '2010-05-15', 
        'Laki-laki', 
        'Islam', 
        '081234567890', 
        'budi@example.com', 
        'Jl. Merdeka No. 123, Jakarta Pusat',
        'SDN 01 Jakarta', 
        'Jl. Pendidikan No. 45, Jakarta', 
        'Ahmad Santoso', 
        '081234567891', 
        'PNS',
        'Jl. Merdeka No. 123, Jakarta', 
        'Siti Aminah', 
        '081234567892', 
        'Ibu Rumah Tangga', 
        'Jl. Merdeka No. 123, Jakarta',
        1, 1, 1, 'pending'
      ]
    });
    
    console.log(`✅ Sample data added with ID: ${sampleId}`);
    
    // 4. Verifikasi
    const count = await client.execute('SELECT COUNT(*) as count FROM users');
    console.log(`📊 Total records: ${count.rows[0].count}`);
    
    console.log('\n🎉 Turso database setup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

createUsersTable();