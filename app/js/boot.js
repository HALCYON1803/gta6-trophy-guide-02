// Leonida Ledger — boot: load the trophy data, wire the controls, and keep
// every view in sync. The app fetches one file, data/trophies.json, from its
// own folder, and makes no other network request. Views switch by tab;
// ?view=tracker|planner|roadmap|missables|about, ?select=<id> and
// ?spoilers=1 preselect a view, a trophy and the spoiler setting, which is
// how the screenshots are taken. Press "/" to jump to search.

import {
  loadEarned, saveEarned, loadNotes, saveNotes,
  loadSpoilers, saveSpoilers, seedFromParams,
  buildExportPayload, parseImportPayload, progressSummary,
} from './store.js';
import { KIND_LABELS } from './filters.js';
import {
  renderDashboard, renderList, renderDetail,
  renderPlanner, renderRoadmap, renderMissables,
} from './views.js';

const params = new URLSearchParams(location.search);
const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;
const phases = data.roadmap_phases;
const validIds = new Set(trophies.map((t) => t.id));

let earned = loadEarned(validIds);
let notes = loadNotes();
let spoilers = loadSpoilers(params);
seedFromParams(earned, trophies, params);
saveEarned(earned);

let view = params.get('view') || 'tracker';
let selectedId = Number(params.get('select')) || null;
const filters = {
  q: params.get('q') || '',
  kind: params.get('kind') || 'all',
  grade: params.get('grade') || 'all',
  status: params.get('status') || 'all',
  sort: params.get('sort') || 'roadmap',
  missableOnly: params.get('missable') === '1',
  unconfirmedOnly: params.get('unconfirmed') === '1',
};

// The context every view function receives: shared state plus the two
// actions views need (toggle a trophy, open a trophy's guide).
const ctx = {
  trophies,
  get earned() { return earned; },
  get spoilers() { return spoilers; },
  get filters() { return filters; },
  get selectedId() { return selectedId; },
  get notes() { return notes; },
  toggleEarned(id, on) {
    if (on) earned.add(id);
    else earned.delete(id);
    saveEarned(earned);
    renderAll();
  },
  select(id, jumpToTracker) {
    selectedId = id;
    if (jumpToTracker) setView('tracker');
    renderAll();
    const panel = document.getElementById('detail');
    if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },
  saveNote(id, text) {
    if (text.trim()) notes[id] = text;
    else delete notes[id];
    saveNotes(notes);
  },
};

function renderAll() {
  renderDashboard(trophies, earned);
  renderList(ctx);
  renderDetail(ctx);
  renderPlanner(ctx);
  renderRoadmap(ctx, phases);
  renderMissables(ctx);
}

function setView(next) {
  view = next;
  for (const button of document.querySelectorAll('[data-view]')) {
    button.classList.toggle('active', button.dataset.view === view);
    button.setAttribute('aria-pressed', String(button.dataset.view === view));
  }
  for (const section of document.querySelectorAll('.view')) {
    section.hidden = section.id !== `view-${view}`;
  }
  renderAll();
}

function downloadFile(name, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

function bindControls() {
  const search = document.getElementById('search');
  search.value = filters.q;
  search.addEventListener('input', () => { filters.q = search.value; renderList(ctx); });
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== search) {
      e.preventDefault();
      search.focus();
    }
  });
  const kind = document.getElementById('kind');
  kind.value = KIND_LABELS[filters.kind] ? filters.kind : 'all';
  kind.addEventListener('change', () => { filters.kind = kind.value; renderList(ctx); });
  const grade = document.getElementById('grade');
  grade.value = filters.grade;
  grade.addEventListener('change', () => { filters.grade = grade.value; renderList(ctx); });
  const status = document.getElementById('status');
  status.value = filters.status;
  status.addEventListener('change', () => { filters.status = status.value; renderList(ctx); });
  const sort = document.getElementById('sort');
  sort.value = filters.sort;
  sort.addEventListener('change', () => { filters.sort = sort.value; renderList(ctx); });
  const missable = document.getElementById('missable-only');
  missable.checked = filters.missableOnly;
  missable.addEventListener('change', () => { filters.missableOnly = missable.checked; renderList(ctx); });
  const unconfirmed = document.getElementById('unconfirmed-only');
  unconfirmed.checked = filters.unconfirmedOnly;
  unconfirmed.addEventListener('change', () => { filters.unconfirmedOnly = unconfirmed.checked; renderList(ctx); });
  const spoiler = document.getElementById('spoilers');
  spoiler.checked = spoilers;
  spoiler.addEventListener('change', () => {
    spoilers = spoiler.checked;
    saveSpoilers(spoilers);
    renderAll();
  });
  for (const button of document.querySelectorAll('[data-view]')) {
    button.addEventListener('click', () => setView(button.dataset.view));
  }
  document.getElementById('export').addEventListener('click', () => {
    downloadFile('leonida-ledger-progress.json', JSON.stringify(buildExportPayload(earned, trophies, notes), null, 2));
  });
  document.getElementById('copy-summary').addEventListener('click', async () => {
    const note = document.getElementById('import-note');
    try {
      await navigator.clipboard.writeText(progressSummary(earned, trophies));
      note.textContent = 'Progress summary copied to the clipboard.';
    } catch {
      note.textContent = progressSummary(earned, trophies);
    }
  });
  document.getElementById('import').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    const note = document.getElementById('import-note');
    if (!file) return;
    try {
      const parsed = parseImportPayload(await file.text(), trophies);
      earned = parsed.earned;
      if (parsed.notes) {
        notes = parsed.notes;
        saveNotes(notes);
      }
      saveEarned(earned);
      renderAll();
      note.textContent = `Imported ${earned.size} earned trophies.`;
    } catch {
      note.textContent = 'That file could not be read as trophy progress. It must be a JSON export from this guide.';
    }
    e.target.value = '';
  });
  document.getElementById('reset').addEventListener('click', () => {
    if (window.confirm('Clear all earned trophies in this browser? This cannot be undone. Export your progress first if you want to keep it.')) {
      earned = new Set();
      saveEarned(earned);
      renderAll();
    }
  });
  document.getElementById('print').addEventListener('click', () => window.print());
}

bindControls();
setView(['tracker', 'planner', 'roadmap', 'missables', 'about'].includes(view) ? view : 'tracker');
