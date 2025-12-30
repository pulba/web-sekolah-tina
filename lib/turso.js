// lib/turso.js
import { createClient } from '@libsql/client';
import { config } from 'dotenv';

// Load environment variables dari .env.local
config({ path: '.env.local' });

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default turso;