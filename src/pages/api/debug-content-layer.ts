// src/pages/api/debug-content-layer.ts
export async function GET() {
  try {
    // Dynamic import untuk hindari build error
    const { getCollection, getEntry } = await import('astro:content');
    
    // Coba semua kemungkinan
    const tests = {
      direct_getCollection: null as any,
      all_collections: null as any,
      manual_lookup: null as any
    };
    
    try {
      tests.direct_getCollection = await getCollection('seoSettings');
    } catch (e: any) {
      tests.direct_getCollection = `Error: ${e.message}`;
    }
    
    try {
      // Coba cari semua koleksi
      const allCollections = [
        'posts',
        'navigation', 
        'seoSettings',
        'profile',
        'pages'
      ];
      
      const results: Record<string, any> = {};
      for (const col of allCollections) {
        try {
          const data = await getCollection(col as any);
          results[col] = { count: data.length, success: true };
        } catch (e: any) {
          results[col] = { success: false, error: e.message };
        }
      }
      tests.all_collections = results;
      
    } catch (e: any) {
      tests.all_collections = `Error: ${e.message}`;
    }
    
    // Cek apakah file bisa diakses manual
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'src/content/seo/global.json');
      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      
      tests.manual_lookup = {
        fileExists: true,
        content: parsed,
        keys: Object.keys(parsed)
      };
    } catch (e: any) {
      tests.manual_lookup = `Error: ${e.message}`;
    }
    
    return new Response(JSON.stringify({
      success: true,
      tests,
      timestamp: new Date().toISOString()
    }, null, 2));
    
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack
    }, null, 2));
  }
}