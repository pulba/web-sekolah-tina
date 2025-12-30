// import turso from "../../../../../lib/turso.js";

// export const prerender = false;

// export async function GET({ params }) {
//   try {
//     const rawId = params.id;

//     if (!rawId) {
//       return new Response(JSON.stringify({
//         success: false,
//         error: "ID tidak ditemukan"
//       }), {
//         status: 400,
//         headers: { "Content-Type": "application/json" }
//       });
//     }

//     // Pastikan ID benar-benar numerik
//     const applicantId = Number(rawId);

//     if (!Number.isInteger(applicantId) || applicantId <= 0) {
//       return new Response(JSON.stringify({
//         success: false,
//         error: "ID tidak valid"
//       }), {
//         status: 400,
//         headers: { "Content-Type": "application/json" }
//       });
//     }

//     const result = await turso.execute({
//       sql: `
//         SELECT 
//           a.*,
//           s.status AS submission_status,
//           s.admin_status,
//           s.published,
//           s.submission_date,
//           s.admin_notes
//         FROM applicants a
//         LEFT JOIN submissions s ON a.id = s.applicant_id
//         WHERE a.id = ?
//         LIMIT 1
//       `,
//       args: [applicantId]
//     });

//     if (result.rows.length === 0) {
//       return new Response(JSON.stringify({
//         success: false,
//         error: "Applicant tidak ditemukan"
//       }), {
//         status: 404,
//         headers: { "Content-Type": "application/json" }
//       });
//     }

//     return new Response(JSON.stringify({
//       success: true,
//       applicant: result.rows[0]
//     }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" }
//     });

//   } catch (error) {

//     return new Response(JSON.stringify({
//       success: false,
//       error: error.message
//     }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" }
//     });
//   }
// }
