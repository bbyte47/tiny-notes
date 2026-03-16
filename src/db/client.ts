import { createRequire } from "node:module";
import { env } from "../lib/env";

export const databasePath = env.DATABASE_PATH;
const require = createRequire(import.meta.url);

export type SQLiteRunResult = {
  changes?: number;
};

export type SQLiteStatement = {
  get: (...params: unknown[]) => unknown;
  all: (...params: unknown[]) => unknown[];
  run: (...params: unknown[]) => SQLiteRunResult;
};

export type SQLiteClient = {
  exec: (sql: string) => void;
  prepare: (sql: string) => SQLiteStatement;
};

function createClient(): SQLiteClient {
  if (typeof Bun !== "undefined") {
    const { Database } = require("bun:sqlite") as {
      Database: new (
        path: string,
        options?: { create?: boolean; strict?: boolean }
      ) => SQLiteClient;
    };

    return new Database(databasePath, { create: true, strict: true });
  }

  const BetterSqlite3 = require("better-sqlite3") as {
    new (path: string): SQLiteClient;
  };

  return new BetterSqlite3(databasePath);
}

declare global {
  // eslint-disable-next-line no-var
  var __tinyNotesDb: SQLiteClient | undefined;
}

export const db = globalThis.__tinyNotesDb ?? createClient();

db.exec("PRAGMA foreign_keys = ON");

if (process.env.NODE_ENV !== "production") {
  globalThis.__tinyNotesDb = db;
}
