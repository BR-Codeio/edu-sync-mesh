// Edu-Sync Mesh — Village Hub backend prototype
//
// Simulates the Node.js + Express server described in docs/TECHNICAL_DOCUMENTATION.md
// running on the Raspberry Pi Village Hub. On a real deployment this has no internet
// uplink at all — the "sync" endpoint below is what would run on a teacher's phone or
// a laptop plugged in briefly while in town, then replicate results back to the Hub.
// For this prototype, both roles run in the same process for simplicity.

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import {
  readDb, addPending, resolveEntry, cacheDirectAnswer, findCachedAnswer,
} from './db.js';
import { lookupOnline } from './lookup.js';
import { getTutorResponse, getSearchUrl } from '../shared/knowledgeBase.js';
import { readLessons, addLesson, getUploadsDir } from './lessons.js';

const app = express();
const PORT = process.env.PORT || 4000;

// multer's default storage strips file extensions, which breaks video
// playback and PDF viewing in the browser (no extension -> server can't tell
// the browser what MIME type it is). Keep the extension, with a sensible
// fallback based on the upload's mimetype if the original had none.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, getUploadsDir()),
  filename: (req, file, cb) => {
    const fallbackExt = file.mimetype === 'application/pdf' ? '.pdf' : '.mp4';
    const ext = path.extname(file.originalname) || fallbackExt;
    const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB — generous for a lesson video; plenty for a PDF
  fileFilter: (req, file, cb) => {
    const allowed = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only video files (mp4, webm, ogg, mov) or PDF documents are accepted'));
  },
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(getUploadsDir()));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'edu-sync-mesh-village-hub', time: new Date().toISOString() });
});

// Ask the tutor a question. Resolution order:
//   1. Already cached on this Hub (asked before, by anyone) -> instant answer
//   2. Local offline knowledge base has a confident match -> instant answer, cache it
//   3. Neither -> queue it as pending, to be resolved on next Data Mule Sync
app.post('/api/tutor/ask', (req, res) => {
  const { question } = req.body || {};
  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: 'question is required' });
  }

  const cached = findCachedAnswer(question);
  if (cached) {
    return res.json({
      status: 'resolved',
      cached: true,
      answer: cached.answer,
      subject: cached.subject,
      sourceUrl: cached.sourceUrl,
    });
  }

  const { text, subject, unresolved } = getTutorResponse(question);

  if (!unresolved) {
    cacheDirectAnswer(question, text, subject);
    return res.json({ status: 'resolved', cached: false, answer: text, subject, sourceUrl: null });
  }

  addPending(question);
  return res.json({
    status: 'pending',
    message: text,
    searchUrl: getSearchUrl(question),
  });
});

app.get('/api/tutor/pending', (req, res) => {
  const db = readDb();
  res.json(db.pending);
});

app.get('/api/tutor/resolved', (req, res) => {
  const db = readDb();
  res.json(db.resolved);
});

// Data Mule Sync: attempts a real online lookup for every pending question.
// Runs sequentially and tolerantly — if one lookup fails (or there's genuinely
// no internet available), that question just stays pending for the next sync.
app.post('/api/sync', async (req, res) => {
  const db = readDb();
  const toResolve = [...db.pending];
  const results = { resolvedCount: 0, stillPendingCount: 0, resolved: [] };

  for (const item of toResolve) {
    const lookup = await lookupOnline(item.question);
    if (lookup) {
      resolveEntry(item.question, lookup.answer, lookup.sourceUrl, null);
      results.resolvedCount += 1;
      results.resolved.push({ question: item.question, answer: lookup.answer, sourceUrl: lookup.sourceUrl });
    } else {
      results.stillPendingCount += 1;
    }
  }

  res.json(results);
});

// Content library: lessons a teacher has uploaded to this Village Hub.
// Any student device on the same Wi-Fi (or this browser, in the prototype)
// can list and download them — no internet needed, since it's served
// straight from this machine over the local network.
app.get('/api/content/lessons', (req, res) => {
  res.json(readLessons());
});

// Teacher upload: stores the file on disk and records its metadata, so it
// immediately becomes available to every student device that syncs with (or
// is directly connected to) this Village Hub. Accepts either a video lesson
// or a document (e.g. a ZIMSEC specimen paper, syllabus, or marking scheme
// the teacher has the right to distribute).
app.post('/api/content/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file received' });
  }
  const { title, subject, keyPoints, level, year, paperType } = req.body || {};
  if (!title || !subject) {
    return res.status(400).json({ error: 'title and subject are required' });
  }

  let parsedKeyPoints = [];
  if (keyPoints) {
    try {
      parsedKeyPoints = JSON.parse(keyPoints);
    } catch {
      // Malformed keyPoints JSON — proceed without it rather than failing the whole upload
    }
  }

  const resourceType = req.file.mimetype === 'application/pdf' ? 'document' : 'video';

  const lesson = addLesson({
    title,
    subject,
    sizeBytes: req.file.size,
    filename: req.file.filename,
    keyPoints: parsedKeyPoints,
    resourceType,
    level,
    year,
    paperType,
  });

  res.json({ status: 'uploaded', lesson });
});

// Multer (and other) errors land here instead of crashing the process or
// returning an HTML error page — important since the frontend expects JSON.
app.use((err, req, res, next) => {
  console.error('[server] Error:', err.message);
  res.status(400).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`\nEdu-Sync Mesh Village Hub backend running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health\n`);
});