// src/lib/test-db.ts
import { checkUsersTable } from './db';

async function test() {
  const result = await checkUsersTable();
}

test();