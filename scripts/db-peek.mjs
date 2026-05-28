import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

console.log('\n=== 🐶 dogs 테이블 ===');
const dogs = await sql`SELECT user_key, data, updated_at FROM dogs ORDER BY updated_at DESC LIMIT 10`;
if (dogs.length === 0) {
  console.log('(저장된 강아지 없음)');
} else {
  for (const row of dogs) {
    const list = Array.isArray(row.data) ? row.data : [];
    console.log(`\n[${row.user_key}]  (${new Date(row.updated_at).toLocaleString('ko-KR')})`);
    list.forEach((d, i) => console.log(`  ${i + 1}. ${d.name} · ${d.age}살 · ${d.weight}kg`));
  }
}

console.log('\n=== 🐾 walk_stamps 테이블 ===');
const stamps = await sql`SELECT user_key, year_month, days, updated_at FROM walk_stamps ORDER BY updated_at DESC LIMIT 10`;
if (stamps.length === 0) {
  console.log('(저장된 도장 없음)');
} else {
  for (const row of stamps) {
    console.log(`[${row.user_key}] ${row.year_month}: ${row.days.length}개 (${row.days.join(',')})`);
  }
}

console.log('');
