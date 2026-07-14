// Talks to the Village Hub backend (server/) when it's running. If the backend
// isn't reachable — e.g. the presenter forgot to start it, or it's a pure
// frontend-only demo — every function here rejects, and App.jsx falls back to
// the original in-browser matching + localStorage queue. The app should never
// visibly break just because the backend isn't running.

const API_BASE = '/api';
const TIMEOUT_MS = 2500;

async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, signal: controller.signal });
    if (!res.ok) throw new Error(`API ${path} returned ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function checkBackendHealth() {
  try {
    const data = await apiFetch('/health');
    return data.status === 'ok';
  } catch {
    return false;
  }
}

/** Returns { status: 'resolved', answer, subject, cached, sourceUrl }
 *  or { status: 'pending', message, searchUrl } */
export function askTutorAPI(question) {
  return apiFetch('/tutor/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
}

export function fetchPendingAPI() {
  return apiFetch('/tutor/pending');
}

export function fetchResolvedAPI() {
  return apiFetch('/tutor/resolved');
}

/** Returns { resolvedCount, stillPendingCount, resolved: [{question, answer, sourceUrl}] } */
export function triggerSyncAPI() {
  return apiFetch('/sync', { method: 'POST' });
}

/** Returns array of lessons teachers have uploaded to this Village Hub. */
export function fetchHubLessons() {
  return apiFetch('/content/lessons');
}

/** Uploads a lesson video. Longer timeout since video files can be large
 * and this is a real file transfer, not a quick JSON round-trip. */
export async function uploadLessonAPI(title, subject, file, onProgress, keyPoints = [], extra = {}) {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('subject', subject);
  formData.append('file', file);
  if (keyPoints.length > 0) {
    formData.append('keyPoints', JSON.stringify(keyPoints));
  }
  if (extra.level) formData.append('level', extra.level);
  if (extra.year) formData.append('year', extra.year);
  if (extra.paperType) formData.append('paperType', extra.paperType);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/content/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(data);
        else reject(new Error(data.error || `Upload failed (${xhr.status})`));
      } catch {
        reject(new Error('Upload failed — invalid response from server'));
      }
    };
    xhr.onerror = () => reject(new Error('Upload failed — network error'));
    xhr.send(formData);
  });
}