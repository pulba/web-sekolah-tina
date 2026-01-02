// src/pages/api/ppdb/update-status.ts
import type { APIRoute } from 'astro';
import { updateUserStatus, getUserById } from '../../../lib/db';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const status = url.searchParams.get('status');
    
    console.log('=== UPDATE STATUS API ===');
    console.log('ID:', id);
    console.log('Status:', status);
    
    if (!id || !status) {
      return new Response(JSON.stringify({
        success: false,
        message: 'ID dan status diperlukan'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validasi status
    const validStatuses = ['pending', 'review', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Status tidak valid. Gunakan: pending, review, approved, atau rejected'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Update status
    const result = await updateUserStatus(id, status);
    
    if (result.success) {
      // Redirect kembali ke admin panel
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/admin/ppdb',
          'Refresh': '0'
        }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: 'Gagal mengupdate status',
        error: result.error
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error: any) {
    console.error('Update status error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};