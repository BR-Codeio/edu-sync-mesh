// Simulates what a teacher's phone (or a USB flash drive from the daily commuter
// omnibus) does once it reaches town and gets real internet access: look up the
// questions the offline Village Hub couldn't answer, then bring the answers back.
//
// This machine (wherever server.js is running - a laptop, or eventually the actual
// Raspberry Pi Village Hub during its own town sync) genuinely has internet access,
// so this performs a real HTTP request to Wikipedia's free public REST API -
// no API key required, no rate-limit issues at hackathon scale.

const WIKI_SUMMARY_ENDPOINT = "https://en.wikipedia.org/api/rest_v1/page/summary/";
const WIKI_SEARCH_ENDPOINT = "https://en.wikipedia.org/w/api.php";

// Strips common question words so "What is photosynthesis?" becomes a better
// Wikipedia search term ("photosynthesis") than the full sentence would be.
function extractSearchTerm(question) {
  return question
    .replace(/\?/g, "")
    .replace(/^(what is|what are|what's|explain|how does|how do|how to|define|tell me about|who is|who was|ndoda kubatsirwa ne|ndibatsire ne)\s+/i, "")
    .replace(/\s+work(s)?$/i, "")
    .trim() || question;
}

async function findWikipediaTitle(searchTerm) {
  const url = `${WIKI_SEARCH_ENDPOINT}?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json&srlimit=1`;
  const res = await fetch(url, { headers: { "User-Agent": "EduSyncMesh-Hackathon-Prototype/1.0" } });
  if (!res.ok) throw new Error(`Wikipedia search failed: ${res.status}`);
  const data = await res.json();
  const first = data?.query?.search?.[0];
  return first ? first.title : null;
}

async function fetchWikipediaSummary(title) {
  const url = WIKI_SUMMARY_ENDPOINT + encodeURIComponent(title);
  const res = await fetch(url, { headers: { "User-Agent": "EduSyncMesh-Hackathon-Prototype/1.0" } });
  if (!res.ok) throw new Error(`Wikipedia summary failed: ${res.status}`);
  return res.json();
}

/**
 * Attempts a real online lookup for a queued question.
 * Returns { answer, sourceUrl } on success, or null if lookup failed
 * (e.g. no internet available right now - which is expected and fine;
 * the question just stays pending until the next sync attempt).
 */
export async function lookupOnline(question) {
  const searchTerm = extractSearchTerm(question);
  try {
    const title = await findWikipediaTitle(searchTerm);
    if (!title) return null;

    const summary = await fetchWikipediaSummary(title);
    if (!summary?.extract) return null;

    return {
      answer: summary.extract,
      sourceUrl: summary.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    };
  } catch (err) {
    console.warn(`[sync] Online lookup failed for "${question}":`, err.message);
    return null;
  }
}

