/**
 * Seed initial restaurants from mock-data into the Drizzle/Postgres DB.
 * Idempotent — uses .onConflictDoNothing on id.
 *
 * Run after `drizzle-kit push` has applied the schema:
 *   pnpm tsx scripts/seed.ts
 */

import "dotenv/config";
import { db } from "../src/lib/db";
import { restaurants } from "../src/lib/db/schema/app";
import { mockRestaurants } from "../src/lib/mock-data";

async function main() {
  console.log(`Seeding ${mockRestaurants.length} restaurants...`);
  for (const r of mockRestaurants) {
    await db
      .insert(restaurants)
      .values({
        id: r.id,
        name: r.name,
        logo: r.logo,
        dataAiHint: r.data_ai_hint,
      })
      .onConflictDoNothing();
    console.log(`  ✓ ${r.name}`);
  }
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
