// src/pages/api/ppdb/admin/applicants.js
import turso from "../../../../../lib/turso.js";
import { requireAdminAuth } from "../../../../lib/adminAuth.js";

export const prerender = false;

/* =========================
   GET DATA ADMIN (READ ONLY)
   TANPA AUTH DULU
========================= */
export async function GET() {
  try {
    const result = await turso.execute(`
      SELECT 
        a.*,
        s.admin_status,
        s.published,
        s.published_jenjang,
        s.submission_date,
        s.admin_notes
      FROM applicants a
      LEFT JOIN submissions s ON a.id = s.applicant_id
      ORDER BY s.submission_date DESC
    `);

    return new Response(JSON.stringify({
      success: true,
      applicants: result.rows
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500 });
  }
}

/* =========================
   UPDATE STATUS (WAJIB AUTH)
========================= */
export async function POST({ request }) {
  if (!requireAdminAuth(request)) {
    return new Response(JSON.stringify({
      success: false,
      error: "Unauthorized"
    }), { status: 401 });
  }

  try {
    const {
      applicantId,
      adminStatus,
      published,
      publishedJenjang,
      adminNotes
    } = await request.json();

    if (!applicantId || !adminStatus) {
      return new Response(JSON.stringify({
        success: false,
        error: "Payload tidak valid"
      }), { status: 400 });
    }

    // ambil status lama
    const current = await turso.execute({
      sql: "SELECT admin_status FROM submissions WHERE applicant_id = ?",
      args: [applicantId]
    });

    const oldStatus = current.rows[0]?.admin_status || null;

    // update status
    await turso.execute({
      sql: `
        UPDATE submissions
        SET admin_status = ?,
            published = ?,
            published_jenjang = ?,
            admin_notes = ?
        WHERE applicant_id = ?
      `,
      args: [
        adminStatus,
        published ? 1 : 0,
        published ? publishedJenjang : null,
        adminNotes || null,
        applicantId
      ]
    });

    // audit log
    await turso.execute({
      sql: `
        INSERT INTO audit_logs
        (applicant_id, action, old_status, new_status, admin_notes)
        VALUES (?, 'update_status', ?, ?, ?)
      `,
      args: [
        applicantId,
        oldStatus,
        adminStatus,
        adminNotes || null
      ]
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500 });
  }
}
