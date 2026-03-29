// scripts/gen-hash.mjs
// Usage: node scripts/gen-hash.mjs <your-password>
// This generates the SHA-256 hash to store in .env.local

import { createHash } from 'crypto';

const password = process.argv[2];

if (!password) {
  console.error('\n  Usage: node scripts/gen-hash.mjs <your-password>\n');
  process.exit(1);
}

const hash = createHash('sha256').update(password).digest('hex');

console.log('\n✅  Hash generated!\n');
console.log(`  Password : ${password}`);
console.log(`  Hash     : ${hash}`);
console.log('\n  Add this line to your .env.local file:');
console.log(`\n  VITE_ADMIN_HASH=${hash}\n`);
