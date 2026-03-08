/**
 * Runs seed-mock-workouts-bulk.sql (generate first with: npm run generate:mock-workouts).
 *
 * Run from backend/: npm run seed:mock-workouts-bulk
 */

import * as fs from 'fs';
import * as path from 'path';
import prisma from '../src/config/database';

async function main() {
  const sqlPath = path.join(__dirname, 'seed-mock-workouts-bulk.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8').trim();
  const count = await prisma.$executeRawUnsafe(sql);
  console.log('Inserted', count, 'mock workout rows.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
