import { describe, expect, test } from "bun:test";

describe("C14 seed data", () => {
  test("seedDemoData is idempotent", async () => {
    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const databasePath = `/tmp/tiny-notes-seed-${uniqueSuffix}.sqlite`;

    process.env.DATABASE_PATH = databasePath;
    process.env.SEED_DEMO_DATA = "1";

    await import("../scripts/migrate.ts");
    const { seedDemoData } = await import("../scripts/seed.ts");
    const { db } = await import("../src/db/client");

    const firstRun = seedDemoData();
    const secondRun = seedDemoData();

    expect(secondRun.userId).toBe(firstRun.userId);
    expect(secondRun.notesCount).toBe(2);

    const noteCountRow = db
      .prepare("SELECT COUNT(*) AS count FROM notes WHERE owner_user_id = ?")
      .get(firstRun.userId) as { count: number };

    expect(noteCountRow.count).toBe(2);
  });
});
