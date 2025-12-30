// src/pages/api/check-seo-file-exists.ts
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  const basePath = process.cwd();
  const filePath = path.join(basePath, 'src/content/seo/global.json');
  const folderPath = path.join(basePath, 'src/content/seo');
  
  try {
    // Cek folder
    const folderExists = await fs.access(folderPath).then(() => true).catch(() => false);
    
    // Cek file
    const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
    
    // Baca isi file jika ada
    let fileContent = null;
    let jsonValid = false;
    
    if (fileExists) {
      fileContent = await fs.readFile(filePath, 'utf-8');
      try {
        JSON.parse(fileContent);
        jsonValid = true;
      } catch (e) {
        jsonValid = false;
      }
    }
    
    return new Response(JSON.stringify({
      folderExists,
      fileExists,
      jsonValid,
      filePath,
      folderPath,
      fileContentPreview: fileContent ? fileContent.substring(0, 500) : null
    }, null, 2));
    
  } catch (error: any) {
    return new Response(JSON.stringify({
      error: error.message
    }, null, 2));
  }
}