import { db } from "../src/db/client";
import { nowIso } from "../src/lib/time";

const DEMO_EMAIL = "demo@tinynotes.local";
const DEMO_NAME = "TinyNotes Demo";
const DEMO_USER_ID = "demo-user";

type CountRow = {
  count: number;
};

type UserRow = {
  id: string;
};

type SeedResult = {
  userId: string;
  notesCount: number;
};

function ensureTableExists(tableName: string): void {
  const row = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1"
    )
    .get(tableName) as { name: string } | undefined;

  if (!row?.name) {
    throw new Error(
      `Missing required table "${tableName}". Run "bun run db:migrate" first.`
    );
  }
}

function ensureSchema(): void {
  ensureTableExists("user");
  ensureTableExists("notes");
}

function upsertDemoUser(timestamp: string): string {
  db.prepare(
    `
    INSERT INTO "user" (
      id,
      email,
      name,
      email_verified,
      image,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, 1, NULL, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      name = excluded.name,
      updated_at = excluded.updated_at
    `
  ).run(DEMO_USER_ID, DEMO_EMAIL, DEMO_NAME, timestamp, timestamp);

  const row = db
    .prepare('SELECT id FROM "user" WHERE email = ? LIMIT 1')
    .get(DEMO_EMAIL) as UserRow | undefined;

  if (!row?.id) {
    throw new Error("Unable to load seeded demo user.");
  }

  return row.id;
}

function upsertDemoNotes(userId: string, timestamp: string): void {
  const welcomeDoc = JSON.stringify({
    type: "doc",
    content: [
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Welcome" }] },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "This is a seeded TinyNotes demo note. Edit me to test updates.",
          },
        ],
      },
    ],
  });

  const checklistDoc = JSON.stringify({
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: "Demo checklist:" }] },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [{ type: "paragraph", content: [{ type: "text", text: "Create note" }] }],
          },
          {
            type: "listItem",
            content: [{ type: "paragraph", content: [{ type: "text", text: "Share note" }] }],
          },
          {
            type: "listItem",
            content: [{ type: "paragraph", content: [{ type: "text", text: "Revoke share" }] }],
          },
        ],
      },
    ],
  });

  const seedNotes = [
    {
      id: "demo-note-welcome",
      title: "Welcome to TinyNotes",
      contentJson: welcomeDoc,
      isShared: 1,
      shareToken: "demo-share-token-welcome-note",
      sharedAt: timestamp,
    },
    {
      id: "demo-note-checklist",
      title: "Demo Checklist",
      contentJson: checklistDoc,
      isShared: 0,
      shareToken: null,
      sharedAt: null,
    },
  ] as const;

  const statement = db.prepare(
    `
    INSERT INTO notes (
      id,
      owner_user_id,
      title,
      content_json,
      is_shared,
      share_token,
      shared_at,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      owner_user_id = excluded.owner_user_id,
      title = excluded.title,
      content_json = excluded.content_json,
      is_shared = excluded.is_shared,
      share_token = excluded.share_token,
      shared_at = excluded.shared_at,
      updated_at = excluded.updated_at
    `
  );

  for (const note of seedNotes) {
    statement.run(
      note.id,
      userId,
      note.title,
      note.contentJson,
      note.isShared,
      note.shareToken,
      note.sharedAt,
      timestamp,
      timestamp
    );
  }
}

export function seedDemoData(): SeedResult {
  ensureSchema();
  const timestamp = nowIso();

  db.exec("BEGIN");
  try {
    const userId = upsertDemoUser(timestamp);
    upsertDemoNotes(userId, timestamp);
    db.exec("COMMIT");

    const notesCount = (
      db
        .prepare("SELECT COUNT(*) AS count FROM notes WHERE owner_user_id = ?")
        .get(userId) as CountRow
    ).count;

    return { userId, notesCount };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function run() {
  if (process.env.SEED_DEMO_DATA !== "1") {
    console.log("seed skipped: set SEED_DEMO_DATA=1 to seed demo records");
    return;
  }

  const result = seedDemoData();
  console.log(`seeded demo user: ${DEMO_EMAIL}`);
  console.log(`seeded notes for demo user: ${result.notesCount}`);
}

if (import.meta.main) {
  run();
}
