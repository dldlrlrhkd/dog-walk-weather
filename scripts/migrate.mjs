import { neon } from '@neondatabase/serverless';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { config } from 'dotenv';

config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not found in .env.local — run `vercel env pull .env.local` first');
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, '..', 'migrations');
const sql = neon(process.env.DATABASE_URL);

const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
for (const file of files) {
  const fullPath = join(migrationsDir, file);
  const content = readFileSync(fullPath, 'utf-8');
  console.log(`\n=== Running ${file} ===`);
  const statements = content.split(/;\s*$/m).map(s => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    await sql.query(stmt);
    console.log('  ✓', stmt.split('\n')[0].slice(0, 80));
  }
}
console.log('\nAll migrations applied.');
