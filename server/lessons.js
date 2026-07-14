// File-based persistence for teacher-uploaded lesson content.
//
// A real Village Hub deployment would serve this from CouchDB with attachments
// (see docs/TECHNICAL_DOCUMENTATION.md). For this prototype, uploaded video files
// live on disk in server/data/uploads/, and their metadata lives in this JSON file
// -- same practical result (survives restarts, shared across every device that
// connects to the Hub's Wi-Fi), without needing a database server installed.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const LESSONS_PATH = path.join(DATA_DIR, "lessons.json");

export function ensureDirs() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!existsSync(LESSONS_PATH)) writeFileSync(LESSONS_PATH, JSON.stringify([], null, 2));
}

export function getUploadsDir() {
  ensureDirs();
  return UPLOADS_DIR;
}

export function readLessons() {
  ensureDirs();
  try {
    return JSON.parse(readFileSync(LESSONS_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function writeLessons(lessons) {
  ensureDirs();
  writeFileSync(LESSONS_PATH, JSON.stringify(lessons, null, 2));
}

export function addLesson({ title, subject, sizeBytes, filename, keyPoints, resourceType, level, year, paperType }) {
  const lessons = readLessons();
  const lesson = {
    id: `hub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title,
    subject,
    size: formatBytes(sizeBytes),
    videoUrl: `/uploads/${filename}`, // generic file location field — points to a PDF for past-paper uploads too
    resourceType: resourceType || "video", // "video" | "document"
    level: level || null, // e.g. "Grade 7", "O Level", "A Level" — only set for past-paper uploads
    year: year || null,
    paperType: paperType || null, // e.g. "Question Paper", "Marking Scheme", "Specimen Paper", "Syllabus"
    keyPoints: Array.isArray(keyPoints) && keyPoints.length > 0 ? keyPoints : null,
    uploadedAt: new Date().toISOString(),
    source: "teacher-upload",
  };
  lessons.push(lesson);
  writeLessons(lessons);
  return lesson;
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}