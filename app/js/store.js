// Leonida Ledger — saved progress store.
// Progress, personal notes and the spoiler setting live in localStorage under
// keys namespaced to this guide, so a reload never loses a tick. Export writes
// a JSON backup file; import reads one back by trophy name (names are the
// stable key, so an export survives a data-file reorder).

export const STORAGE_KEY = 'leonida-ledger-earned-v2';
export const NOTES_KEY = 'leonida-ledger-notes-v2';
export const SPOILER_KEY = 'leonida-ledger-spoilers-v2';

// A demo seed for screenshots and first-time tries: ?seed=N earns the first N
// trophies in roadmap order (skipping the platinum, which only the full list
// can earn), only when nothing is saved yet. It never overwrites progress.
export function seedFromParams(earned, trophies, params) {
  const n = Number(params.get('seed'));
  if (!n || earned.size) return;
  const ordered = [...trophies]
    .filter((t) => t.kind !== 'platinum')
    .sort((a, b) => (a.phase - b.phase) || ((a.chapter ?? 99) - (b.chapter ?? 99)) || (a.id - b.id));
  for (const t of ordered.slice(0, n)) earned.add(t.id);
}

export function loadEarned(validIds) {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(raw)) return new Set();
    return new Set(raw.filter((id) => validIds.has(id)));
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  } catch { /* private mode: progress just does not persist */ }
}

export function loadNotes() {
  try {
    const raw = JSON.parse(localStorage.getItem(NOTES_KEY) ?? '{}');
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {};
  }
}

export function saveNotes(notes) {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch { /* private mode */ }
}

export function loadSpoilers(params) {
  if (params.get('spoilers') === '1') return true;
  if (params.get('spoilers') === '0') return false;
  try {
    return localStorage.getItem(SPOILER_KEY) === '1';
  } catch {
    return false;
  }
}

export function saveSpoilers(on) {
  try {
    localStorage.setItem(SPOILER_KEY, on ? '1' : '0');
  } catch { /* private mode */ }
}

// Build the export payload: trophy names (stable) plus notes and the date.
export function buildExportPayload(earned, trophies, notes) {
  const byId = new Map(trophies.map((t) => [t.id, t]));
  return {
    game: 'Grand Theft Auto VI',
    platform: 'PlayStation 5',
    guide: 'Leonida Ledger',
    exported: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b).map((id) => byId.get(id).name),
    notes,
  };
}

// Parse an export back into a set of earned ids. Accepts this guide's format
// (names) and the plain array-of-names form, and ignores unknown names.
export function parseImportPayload(text, trophies) {
  const data = JSON.parse(text);
  const names = new Set(Array.isArray(data) ? data : data.earned || []);
  const next = new Set();
  for (const t of trophies) if (names.has(t.name)) next.add(t.id);
  const notes = data && typeof data === 'object' && data.notes && typeof data.notes === 'object' ? data.notes : null;
  return { earned: next, notes };
}

// One-line human summary for sharing: "Leonida Ledger: 13/55 trophies …".
export function progressSummary(earned, trophies) {
  const done = earned.size;
  const total = trophies.length;
  const gs = trophies.filter((t) => earned.has(t.id)).reduce((s, t) => s + t.gamerscore, 0);
  const left = trophies.filter((t) => !earned.has(t.id));
  const hoursLeft = left.reduce((s, t) => s + (t.hours || 0), 0);
  return `Leonida Ledger — GTA VI trophies: ${done}/${total} earned (${Math.round((done / total) * 100)}%), ${gs}/1,000G, about ${hoursLeft}h of grind left. One possibly missable trophy: Positive Mental Attitude (Chapter 1 meditation spot).`;
}
