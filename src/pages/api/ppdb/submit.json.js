// @ts-check
import { getTursoClient, executeTransaction } from '../../../lib/turso.js';

export async function POST({ request }) {
  try {
    const data = await request.json();
    
    // Validasi data
    const validationErrors = validateSubmission(data);
    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          errors: validationErrors 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate unique IDs
    const applicantId = generateApplicantId();
    const nomorPendaftaran = generateNomorPendaftaran(data.tahun_ppdb, data.jenjang_pendidikan);
    
    const client = getTursoClient();
    
    // Begin transaction
    await client.execute('BEGIN');
    
    try {
      // 1. Insert into applicants table
      await client.execute({
        sql: `INSERT INTO applicants (
          applicant_id, nama_lengkap, nama_panggilan, 
          tempat_lahir, tanggal_lahir, jenis_kelamin,
          agama, no_hp, email, alamat_lengkap
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          applicantId,
          data.nama_lengkap,
          data.nama_panggilan,
          data.tempat_lahir,
          data.tanggal_lahir,
          data.jenis_kelamin,
          data.agama,
          data.no_hp,
          data.email,
          data.alamat_lengkap
        ]
      });
      
      // 2. Insert previous education
      await client.execute({
        sql: `INSERT INTO previous_education (
          applicant_id, asal_sekolah, alamat_asal_sekolah
        ) VALUES (?, ?, ?)`,
        args: [
          applicantId,
          data.asal_sekolah,
          data.alamat_asal_sekolah
        ]
      });
      
      // 3. Insert majors based on jenjang
      if (data.jenjang_pendidikan === 'SMA') {
        await client.execute({
          sql: `INSERT INTO majors (
            applicant_id, jenjang_pendidikan,
            jurusan_pilihan_1, jurusan_pilihan_2
          ) VALUES (?, ?, ?, ?)`,
          args: [
            applicantId,
            data.jenjang_pendidikan,
            data.jurusan_pilihan_1,
            data.jurusan_pilihan_2 || null
          ]
        });
      } else if (data.jenjang_pendidikan === 'SMK') {
        await client.execute({
          sql: `INSERT INTO majors (
            applicant_id, jenjang_pendidikan,
            jurusan_utama, jurusan_alternatif
          ) VALUES (?, ?, ?, ?)`,
          args: [
            applicantId,
            data.jenjang_pendidikan,
            data.jurusan_utama,
            data.jurusan_alternatif || null
          ]
        });
      } else {
        // SMP
        await client.execute({
          sql: `INSERT INTO majors (applicant_id, jenjang_pendidikan) VALUES (?, ?)`,
          args: [applicantId, data.jenjang_pendidikan]
        });
      }
      
      // 4. Insert parents data
      await client.execute({
        sql: `INSERT INTO parents (
          applicant_id,
          nama_ayah, no_hp_ayah, pekerjaan_ayah, alamat_ayah,
          nama_ibu, no_hp_ibu, pekerjaan_ibu, alamat_ibu
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          applicantId,
          data.nama_ayah,
          data.no_hp_ayah,
          data.pekerjaan_ayah,
          data.alamat_ayah,
          data.nama_ibu,
          data.no_hp_ibu,
          data.pekerjaan_ibu,
          data.alamat_ibu
        ]
      });
      
      // 5. Insert submission
      await client.execute({
        sql: `INSERT INTO submissions (
          applicant_id, tahun_ppdb, jenjang_pendidikan,
          setuju_ketentuan, nomor_pendaftaran, status
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          applicantId,
          data.tahun_ppdb,
          data.jenjang_pendidikan,
          data.setuju_ketentuan ? 1 : 0,
          nomorPendaftaran,
          'pending'
        ]
      });
      
      await client.execute('COMMIT');
      
      return new Response(
        JSON.stringify({
          success: true,
          applicant_id: applicantId,
          nomor_pendaftaran: nomorPendaftaran,
          message: 'Pendaftaran berhasil!'
        }),
        { 
          status: 201, 
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          } 
        }
      );
      
    } catch (error) {
      await client.execute('ROLLBACK');
      console.error('Database error:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('Error in submit API:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error'
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Helper functions
function validateSubmission(data) {
  const errors = [];
  
  // Required fields
  const required = [
    'tahun_ppdb', 'jenjang_pendidikan', 'nama_lengkap', 'nama_panggilan',
    'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin', 'agama', 'no_hp',
    'email', 'alamat_lengkap', 'asal_sekolah', 'alamat_asal_sekolah',
    'nama_ayah', 'no_hp_ayah', 'pekerjaan_ayah', 'alamat_ayah',
    'nama_ibu', 'no_hp_ibu', 'pekerjaan_ibu', 'alamat_ibu'
  ];
  
  required.forEach(field => {
    if (!data[field] || data[field].toString().trim() === '') {
      errors.push(`${field.replace(/_/g, ' ')} harus diisi`);
    }
  });
  
  if (!data.setuju_ketentuan) {
    errors.push('Harus menyetujui ketentuan');
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailRegex.test(data.email)) {
    errors.push('Email tidak valid');
  }
  
  // Jenjang-specific validation
  if (data.jenjang_pendidikan === 'SMA' && !data.jurusan_pilihan_1) {
    errors.push('Jurusan pilihan 1 harus diisi untuk SMA');
  }
  
  if (data.jenjang_pendidikan === 'SMK' && !data.jurusan_utama) {
    errors.push('Jurusan utama harus diisi untuk SMK');
  }
  
  return errors;
}

function generateApplicantId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 6);
  return `APP-${timestamp}-${random}`.toUpperCase();
}

function generateNomorPendaftaran(tahun, jenjang) {
  const prefix = jenjang === 'SMP' ? '01' : jenjang === 'SMA' ? '02' : '03';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PPDB-${tahun}-${prefix}-${timestamp}${random}`;
}

// GET handler untuk preview (optional)
export async function GET() {
  return new Response(
    JSON.stringify({ message: 'Use POST to submit PPDB application' }),
    { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}