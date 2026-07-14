// Minimal file-based persistence for the Village Hub backend prototype.
//
// A real Village Hub deployment would use CouchDB (see docs/TECHNICAL_DOCUMENTATION.md
// Section 1 "Village Hub Software Stack") so it can replicate with PouchDB on student/teacher
// phones. For this hackathon prototype, a JSON file gives the same practical result -
// real persistence across restarts - without requiring a database server to install.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "qa-store.json");

function ensureDb() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DB_PATH)) {
    writeFileSync(DB_PATH, JSON.stringify({ pending: [], resolved: [] }, null, 2));
  }
}

export function readDb() {
  ensureDb();
  try {
    return JSON.parse(readFileSync(DB_PATH, "utf-8"));
  } catch {
    return { pending: [], resolved: [] };
  }
}

export function writeDb(db) {
  ensureDb();
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function normalizeForMatch(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

/** Looks for an already-resolved answer to a question asked before (by anyone,
 * on any device syncing with this Hub) - this is the "once synced, stays answered
 * for everyone" persistence the whole feature is about. */
export function findCachedAnswer(question) {
  const db = readDb();
  const normalized = normalizeForMatch(question);
  return db.resolved.find((r) => normalizeForMatch(r.question) === normalized) || null;
}

export function addPending(question) {
  const db = readDb();
  const normalized = normalizeForMatch(question);
  const alreadyPending = db.pending.some((p) => normalizeForMatch(p.question) === normalized);
  const alreadyResolved = db.resolved.some((r) => normalizeForMatch(r.question) === normalized);
  if (alreadyPending || alreadyResolved) return db;

  db.pending.push({
    id: `pq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    question,
    askedAt: new Date().toISOString(),
  });
  writeDb(db);
  return db;
}

export function resolveEntry(question, answer, sourceUrl, subject) {
  const db = readDb();
  const normalized = normalizeForMatch(question);
  db.pending = db.pending.filter((p) => normalizeForMatch(p.question) !== normalized);
  db.resolved.push({
    id: `rq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    question,
    answer,
    sourceUrl: sourceUrl || null,
    subject: subject || null,
    resolvedAt: new Date().toISOString(),
  });
  writeDb(db);
  return db;
}

export function cacheDirectAnswer(question, answer, subject) {
  // For questions the local knowledge base CAN answer immediately - cache them too,
  // so repeated common questions across many students resolve from the Hub's local
  // store rather than re-running the matcher every time.
  const db = readDb();
  const normalized = normalizeForMatch(question);
  const alreadyResolved = db.resolved.some((r) => normalizeForMatch(r.question) === normalized);
  if (alreadyResolved) return db;
  db.resolved.push({
    id: `rq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    question,
    answer,
    sourceUrl: null,
    subject: subject || null,
    resolvedAt: new Date().toISOString(),
    fromLocalKnowledgeBase: true,
  });
  writeDb(db);
  return db;
}

