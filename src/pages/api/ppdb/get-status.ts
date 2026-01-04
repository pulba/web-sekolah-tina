// src/pages/api/ppdb/get-status.ts
import type { APIRoute } from 'astro';
import { getUserById } from '../../../lib/db';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        message: 'ID pendaftaran diperlukan'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const result = await getUserById(id);
    
    if (result.success && result.data) {
      return new Response(JSON.stringify({
        success: true,
        data: result.data
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: result.message || 'Data tidak ditemukan'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error: any) {
    console.error('Status check error:', error);
    
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