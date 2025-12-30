// // src/pages/api/ppdb/get-applicants.js
// import turso from "../../../../lib/turso.js";

// export const prerender = false;

// export async function GET() {
//   try {
//     const result = await turso.execute('SELECT * FROM applicants');
    
//     return new Response(JSON.stringify({
//       success: true,
//       applicants: result.rows
//     }), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' }
//     });
//   } catch (error) {
//     return new Response(JSON.stringify({
//       success: false,
//       error: error.message
//     }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' }
//     });
//   }
// }