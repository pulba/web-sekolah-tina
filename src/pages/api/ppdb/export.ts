// src/pages/api/ppdb/export.ts
import type { APIRoute } from 'astro';
import { getAllUsers } from '../../../lib/db';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const tahun = url.searchParams.get('tahun');
    
    console.log('=== EXPORT API CALLED ===');
    console.log('Tahun filter:', tahun || 'Semua');
    
    const result = await getAllUsers();
    
    if (!result.success) {
      console.error('Failed to get users:', result.error);
      return new Response(JSON.stringify({
        success: false,
        message: 'Gagal mengambil data dari database'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`Found ${result.data.length} users total`);
    
    // Filter by year if specified
    let users = result.data;
    if (tahun && tahun !== 'Semua') {
      users = users.filter(user => user.tahun_ppdb === tahun);
      console.log(`Filtered to ${users.length} users for year ${tahun}`);
    }
    
    // Jika tidak ada data
    if (users.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Tidak ada data untuk diexport'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Convert to CSV
    const headers = [
      'ID', 
      'Tahun PPDB', 
      'Nama Lengkap', 
      'Nama Panggilan', 
      'Tempat Lahir', 
      'Tanggal Lahir', 
      'Jenis Kelamin', 
      'Agama', 
      'Nomor HP', 
      'Email',
      'Asal Sekolah',
      'Alamat Sekolah',
      'Nama Ayah',
      'Telepon Ayah',
      'Pekerjaan Ayah',
      'Alamat Ayah',
      'Nama Ibu',
      'Telepon Ibu',
      'Pekerjaan Ibu',
      'Alamat Ibu',
      'Status', 
      'Dibuat Pada', 
      'Terakhir Update'
    ];
    
    // Helper function untuk escape CSV
    const escapeCsv = (value: any) => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };
    
    const csvRows = [
      headers.join(','),
      ...users.map(user => [
        escapeCsv(user.id),
        escapeCsv(user.tahun_ppdb),
        escapeCsv(user.nama_lengkap),
        escapeCsv(user.nama_panggilan),
        escapeCsv(user.tempat_lahir),
        escapeCsv(user.tanggal_lahir),
        escapeCsv(user.jenis_kelamin),
        escapeCsv(user.agama),
        escapeCsv(user.nomor_hp),
        escapeCsv(user.email),
        escapeCsv(user.asal_sekolah),
        escapeCsv(user.alamat_sekolah),
        escapeCsv(user.nama_ayah),
        escapeCsv(user.telepon_ayah),
        escapeCsv(user.pekerjaan_ayah),
        escapeCsv(user.alamat_ayah),
        escapeCsv(user.nama_ibu),
        escapeCsv(user.telepon_ibu),
        escapeCsv(user.pekerjaan_ibu),
        escapeCsv(user.alamat_ibu),
        escapeCsv(user.status || 'pending'),
        escapeCsv(new Date(user.created_at).toLocaleString('id-ID')),
        escapeCsv(new Date(user.updated_at).toLocaleString('id-ID'))
      ].join(','))
    ];
    
    const csv = csvRows.join('\n');
    
    const filename = tahun && tahun !== 'Semua' 
      ? `pendaftaran-ppdb-${tahun.replace(/\//g, '-')}.csv`
      : 'pendaftaran-ppdb-semua-tahun.csv';
    
    console.log(`Export successful: ${filename}, ${users.length} records`);
    
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
    
  } catch (error: any) {
    console.error('=== EXPORT ERROR ===');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Terjadi kesalahan server saat export data',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};