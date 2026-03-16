import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { db, databasePath } from "../src/db/client";

const migrationsDir = path.join(process.cwd(), "src", "db", "migrations");

type MigrationRecord = {
  filename: string;
  checksum: string;
};

function checksumOf(contents: string): string {
  return createHash("sha256").update(contents).digest("hex");
}

function ensureLedgerTable(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      filename TEXT PRIMARY KEY,
      checksum TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);
}

function appliedMigrations(): Map<string, string> {
  const rows = db
    .prepare("SELECT filename, checksum FROM _migrations ORDER BY filename ASC")
    .all() as MigrationRecord[];

  return new Map(rows.map((row) => [row.filename, row.checksum]));
}

function migrationFiles(): string[] {
  mkdirSync(migrationsDir, { recursive: true });

  return readdirSync(migrationsDir)
    .filter((filename) => filename.endsWith(".sql"))
    .sort();
}

function run(): void {
  ensureLedgerTable();

  const knownChecksums = appliedMigrations();
  const files = migrationFiles();
  let appliedCount = 0;

  for (const filename of files) {
    const fullPath = path.join(migrationsDir, filename);
    const sql = readFileSync(fullPath, "utf8");
    const checksum = checksumOf(sql);
    const alreadyAppliedChecksum = knownChecksums.get(filename);

    if (alreadyAppliedChecksum) {
      if (alreadyAppliedChecksum !== checksum) {
        throw new Error(
          `Checksum mismatch for migration ${filename}. Expected ${alreadyAppliedChecksum}, got ${checksum}.`
        );
      }

      continue;
    }

    db.exec(sql);

    db.prepare(
      "INSERT INTO _migrations (filename, checksum, applied_at) VALUES (?, ?, ?)"
    ).run(filename, checksum, new Date().toISOString());

    appliedCount += 1;
  }

  console.log(`database: ${databasePath}`);
  console.log(`migrations found: ${files.length}`);
  console.log(`migrations applied: ${appliedCount}`);
}

run();
