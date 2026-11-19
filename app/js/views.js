// Leonida Ledger — all rendering: dashboard, trophy list, detail panel,
// Next Up planner, roadmap, chapter bars and the missables page.
// Every view re-renders from the same state (trophies, earned set, notes,
// spoiler flag), so a tick anywhere updates every page at once.

import { KIND_LABELS, visibleTrophies, nextUp, dashboardTotals } from './filters.js';

export function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function gradeBadge(t) {
  return t.grade === 'platinum' ? '◆ Platinum'
    : t.grade === 'gold' ? '◆ Gold'
    : t.grade === 'silver' ? '◆ Silver'
    : '◆ Bronze';
}

function difficultyLabel(t) {
  return '●'.repeat(t.difficulty) + '○'.repeat(5 - t.difficulty) + ` ${t.difficulty}/5`;
}

function isMasked(t, spoilers, earned) {
  return t.hidden && !spoilers && !earned.has(t.id);
}

function hoursLabel(t) {
  if (t.hours) return `~${t.hours}h`;
  if (t.kind === 'story') return 'story';
  if (t.kind === 'platinum' || t.kind === 'completion') return 'the whole run';
  return 'quick';
}

// ---- Dashboard: ring, stats, grade bars ----
export function renderDashboard(trophies, earned) {
  const totals = dashboardTotals(trophies, earned);
  const pct = Math.round((totals.done / totals.total) * 100);
  document.getElementById('progress-count').textContent = `${totals.done} / ${totals.total}`;
  const ring = document.getElementById('ring-fg');
  ring.style.strokeDashoffset = String(326.7 * (1 - totals.done / totals.total));
  document.getElementById('stat-gamerscore').textContent = `${totals.gs.toLocaleString()} / 1,000G`;
  document.getElementById('stat-hours').textContent = `~${totals.hoursLeft} h`;
  document.getElementById('stat-missable').textContent = `${totals.missableDone} / 1`;
  document.getElementById('stat-unconfirmed').textContent = String(totals.unconfirmedLeft);
  const bars = document.getElementById('grade-bars');
  bars.replaceChildren();
  for (const g of ['platinum', 'gold', 'silver', 'bronze']) {
    const row = el('div', `grade-row ${g}`);
    row.append(el('span', null, g[0].toUpperCase() + g.slice(1)));
    const bar = el('div', 'bar');
    const fill = el('i');
    fill.style.width = `${totals.grades[g].total ? Math.round((totals.grades[g].done / totals.grades[g].total) * 100) : 0}%`;
    bar.append(fill);
    row.append(bar);
    row.append(el('span', null, `${totals.grades[g].done}/${totals.grades[g].total}`));
    bars.append(row);
  }
  return totals;
}

// ---- Trophy list ----
export function renderList(ctx) {
  const { trophies, earned, spoilers, filters, selectedId } = ctx;
  const list = document.getElementById('trophy-list');
  const shown = visibleTrophies(trophies, filters, earned);
  document.getElementById('list-count').textContent =
    `Showing ${shown.length} of ${trophies.length} trophies${earned.size ? ` · ${earned.size} earned` : ''}`;
  list.replaceChildren();
  for (const t of shown) {
    const masked = isMasked(t, spoilers, earned);
    const card = el('article', 'trophy' + (earned.has(t.id) ? ' earned' : '') + (selectedId === t.id ? ' selected' : ''));
    const box = el('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Earned: ${masked ? 'hidden trophy' : t.name}`);
    box.addEventListener('change', () => ctx.toggleEarned(t.id, box.checked));
    const body = el('div', 'trophy-body');
    const head = el('div', 'trophy-head');
    head.append(el('span', 'grade ' + t.grade, gradeBadge(t)));
    head.append(el('span', 'kind', KIND_LABELS[t.kind]));
    if (t.missable === 'possible') head.append(el('span', 'missable', '⚠ Possibly missable'));
    if (t.hidden) head.append(el('span', 'hidden-tag', 'Hidden on PS5'));
    if (t.confidence === 'unconfirmed') head.append(el('span', 'unconfirmed-tag', 'Unconfirmed'));
    head.append(el('span', 'phase-tag', `Phase ${t.phase}`));
    body.append(head);
    body.append(el('h3', null, masked ? 'Hidden trophy — earn it to reveal' : t.name));
    body.append(el('p', 'desc', masked ? 'This trophy stays hidden on PlayStation until you earn it. Turn spoilers on to see it.' : t.description));
    body.append(el('p', 'meta', masked ? '' : `Target: ${t.target} · Difficulty ${difficultyLabel(t)} · ${hoursLabel(t)} · Xbox ${t.gamerscore}G`));
    const open = el('button', 'guide-btn', 'Guide & sources');
    open.type = 'button';
    open.addEventListener('click', () => ctx.select(t.id, true));
    body.append(open);
    card.append(box, body);
    list.append(card);
  }
  if (!shown.length) list.append(el('p', 'empty', 'No trophies match these filters. Clear the search or a filter to see more.'));
}

// ---- Detail panel: one trophy's guide, steps, sources and note ----
export function renderDetail(ctx) {
  const { trophies, earned, spoilers, selectedId, notes } = ctx;
  const panel = document.getElementById('detail');
  panel.replaceChildren();
  const t = trophies.find((x) => x.id === selectedId);
  if (!t) {
    panel.append(el('p', 'empty', 'Pick a trophy on the left to read its full guide: numbered steps, what to watch for, and its sources. The guide says what to do, where, and whether it can be missed.'));
    return;
  }
  const masked = isMasked(t, spoilers, earned);
  panel.append(el('h2', null, masked ? 'Hidden trophy' : t.name));
  panel.append(el('p', 'desc', masked ? 'This trophy stays hidden on PlayStation until you earn it. Turn spoilers on to read its guide.' : t.description));
  if (masked) return;
  const facts = el('dl', 'facts');
  for (const [k, v] of [
    ['Grade', gradeBadge(t)],
    ['Kind', KIND_LABELS[t.kind]],
    ['Target', t.target],
    ['Difficulty', difficultyLabel(t)],
    ['Time (est.)', hoursLabel(t)],
    ['Xbox Gamerscore', `${t.gamerscore}G`],
    ['Missable', t.missable === 'possible' ? 'Possibly — see the warning in the guide' : 'No'],
    ['Hidden on PS5', t.hidden ? 'Yes' : 'No'],
    ['Chapter', t.chapter ? `Chapter ${t.chapter}` : 'Not a story trophy'],
    ['Roadmap phase', `Phase ${t.phase}`],
  ]) {
    facts.append(el('dt', null, k), el('dd', null, v));
  }
  panel.append(facts);
  panel.append(el('h3', null, 'How to unlock it'));
  panel.append(el('p', null, t.guide));
  panel.append(el('h3', null, 'Steps'));
  const steps = el('ol', 'steps');
  for (const s of t.steps) steps.append(el('li', null, s));
  panel.append(steps);
  const conf = t.confidence === 'unconfirmed'
    ? 'Confidence: unconfirmed. No guide has pinned down the exact trigger yet, and this guide says so instead of guessing. Check the sources below for updates.'
    : t.confidence === 'reported'
      ? 'Confidence: reported. The steps come from PowerPyx and GTABase via GTA-Zone, cross-checked against the Exophase / PSNProfiles list on PlanetGTA6. The game is days old, so details may still change.'
      : 'Confidence: official. The name, description and grade are PlayStation’s own.';
  panel.append(el('p', 'confidence', conf));
  panel.append(el('h3', null, 'Sources'));
  const list = el('ul', 'sources');
  for (const s of t.sources) {
    const li = el('li');
    const a = el('a', null, s.name);
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    li.append(a);
    list.append(li);
  }
  panel.append(list);
  const noteBox = el('div', 'note-box');
  noteBox.append(el('label', null, 'Your note (saved in this browser)'));
  const area = el('textarea');
  area.value = notes[t.id] || '';
  area.placeholder = 'e.g. “2 of 18 meditation spots done — next is the beach one”';
  area.setAttribute('aria-label', `Personal note for ${t.name}`);
  area.addEventListener('input', () => ctx.saveNote(t.id, area.value));
  noteBox.append(area);
  panel.append(noteBox);
  const toggle = el('button', 'earned-btn', earned.has(t.id) ? 'Mark as not earned' : 'Mark as earned');
  toggle.type = 'button';
  toggle.addEventListener('click', () => ctx.toggleEarned(t.id, !earned.has(t.id)));
  panel.append(toggle);
}

// ---- Next Up planner ----
export function renderPlanner(ctx) {
  const { trophies, earned } = ctx;
  const wrap = document.getElementById('planner');
  wrap.replaceChildren();
  const picks = nextUp(trophies, earned, 5);
  if (!picks.length) {
    wrap.append(el('p', 'empty', 'Nothing left but the story and the platinum — you are nearly there.'));
    return;
  }
  picks.forEach((pick, i) => {
    const t = pick.trophy;
    const card = el('div', 'plan-card');
    card.append(el('div', 'plan-rank', `#${i + 1}`));
    const body = el('div');
    body.append(el('h3', null, t.name));
    body.append(el('p', 'desc', t.description));
    body.append(el('p', 'why', `${pick.why} · Target: ${t.target}`));
    card.append(body);
    const go = el('button', 'go guide-btn', 'Open guide');
    go.type = 'button';
    go.addEventListener('click', () => ctx.select(t.id, true));
    card.append(go);
    wrap.append(card);
  });
  const left = trophies.filter((t) => !earned.has(t.id) && t.kind !== 'story' && t.kind !== 'platinum');
  wrap.append(el('p', 'sub', `${left.length} non-story trophies still open after these five. The planner ranks by difficulty first, confirmed before unconfirmed, so finishing the easy certain ones first keeps the list shrinking fast.`));
}

// ---- Roadmap: six phases with progress + chapter bars ----
export function renderRoadmap(ctx, phases) {
  const { trophies, earned, spoilers } = ctx;
  const wrap = document.getElementById('roadmap');
  wrap.replaceChildren();
  for (const phase of phases) {
    const ids = trophies.filter((t) => t.phase === phase.phase).map((t) => t.id);
    const done = ids.filter((id) => earned.has(id)).length;
    const section = el('section', 'phase');
    section.append(el('h3', null, `Phase ${phase.phase} — ${phase.title} (${done}/${ids.length} earned, ${phase.time})`));
    const bar = el('div', 'bar');
    const fill = el('i');
    fill.style.width = `${ids.length ? Math.round((done / ids.length) * 100) : 0}%`;
    bar.append(fill);
    section.append(bar);
    section.append(el('p', null, phase.text));
    const chips = el('div', 'chips');
    for (const id of ids) {
      const t = trophies.find((x) => x.id === id);
      const chip = el('button', 'chip' + (earned.has(id) ? ' earned' : ''), isMasked(t, spoilers, earned) ? 'Hidden trophy' : t.name);
      chip.type = 'button';
      chip.addEventListener('click', () => ctx.select(id, true));
      chips.append(chip);
    }
    section.append(chips);
    wrap.append(section);
  }
  const chapterWrap = document.getElementById('chapter-bars');
  chapterWrap.replaceChildren();
  for (let ch = 1; ch <= 5; ch += 1) {
    const inChapter = trophies.filter((t) => t.chapter === ch);
    const done = inChapter.filter((t) => earned.has(t.id)).length;
    const row = el('div', 'chapter-row');
    row.append(el('span', null, `Chapter ${ch}`));
    const bar = el('div', 'bar');
    const fill = el('i');
    fill.style.width = `${inChapter.length ? Math.round((done / inChapter.length) * 100) : 0}%`;
    bar.append(fill);
    row.append(bar);
    row.append(el('span', null, `${done}/${inChapter.length}`));
    chapterWrap.append(row);
  }
}

// ---- Missables page ----
export function renderMissables(ctx) {
  const { trophies, earned, spoilers } = ctx;
  const wrap = document.getElementById('missables');
  wrap.replaceChildren();
  wrap.append(el('p', 'lede', 'Good news first: 54 of the 55 trophies cannot be missed. Every story trophy pops by playing the missions, every side strand stays open after the story, and nothing on the 100% checklist is missable. There is exactly one possible exception, and one habit that protects you from everything else.'));
  const warn = el('div', 'warning');
  warn.append(el('h3', null, '⚠ The one possibly missable trophy'));
  warn.append(el('p', null, 'Positive Mental Attitude — meditate at every spot across Leonida (18 spots, 10 locations). The first meditation spot is offered at home in Chapter 1 and becomes permanently unavailable after that chapter. PowerPyx got the trophy after doing it, but it is not yet confirmed whether the trophy needs that spot, so do it in Chapter 1 to be safe. The last spot needs Jason and Lucia playable together, which opens after Chapter 2.'));
  wrap.append(warn);
  const habit = el('div', 'tip');
  habit.append(el('h3', null, 'The habit that covers everything else'));
  habit.append(el('p', null, 'Keep a manual save at the start of every chapter and one before the final mission. There is no mission replay and no New Game+, so a chapter-start save is your only way back. And keep cheats off while trophy hunting: using one disables trophies and saving.'));
  wrap.append(habit);
  wrap.append(el('h3', null, 'All trophies by missable status'));
  const rows = el('ul', 'missable-list');
  for (const t of trophies) {
    const li = el('li', t.missable === 'possible' ? 'possible' : '');
    li.textContent = `${earned.has(t.id) ? '✓ ' : ''}${isMasked(t, spoilers, earned) ? 'Hidden trophy' : t.name} — ${t.missable === 'possible' ? 'POSSIBLY MISSABLE: do the Chapter 1 meditation spot' : 'Cannot be missed'}`;
    rows.append(li);
  }
  wrap.append(rows);
  const note = el('p', 'sources-note', 'Missable status: PowerPyx via GTA-Zone, cross-checked with PlanetGTA6 and OutputLag. Sources: ');
  const a = el('a', null, 'GTA-Zone trophy list');
  a.href = 'https://gta-zone.com/news/gta-6-trophies-achievements/';
  a.target = '_blank';
  a.rel = 'noopener';
  note.append(a);
  wrap.append(note);
}
