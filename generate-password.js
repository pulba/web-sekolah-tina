// generate-password.js (ES Module)
import crypto from 'crypto';

function generatePassword(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const randomBytes = crypto.randomBytes(length);
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += chars[randomBytes[i] % chars.length];
  }
  
  return password;
}

function generateSecret() {
  return crypto.randomBytes(32).toString('base64');
}

console.log('=== GENERATE SECURE CREDENTIALS ===');
console.log('⚠️  Simpan informasi ini dengan aman! ⚠️\n');

const username = 'admin_ppdb';
const password = generatePassword();
const secret = generateSecret();

console.log('Username:', username);
console.log('Password:', password);
console.log('Session Secret:', secret);

console.log('\n📋 Copy ke file .env:');
console.log('ADMIN_USERNAME=' + username);
console.log('ADMIN_PASSWORD=' + password);
console.log('SESSION_SECRET=' + secret);

console.log('\n🔐 Tips Keamanan:');
console.log('1. Jangan share file .env');
console.log('2. Ganti password secara berkala');
console.log('3. Gunakan password manager');