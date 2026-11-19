// Leonida Ledger — filtering, sorting and the Next Up ranking.
// Filters: free-text search (name, description, guide and steps), kind,
// grade, earned status, missable-only and unconfirmed-only. Sort orders:
// roadmap order (phase, then chapter, then id), easiest first (difficulty,
// then hours, then phase), name, grade, and story chapter.

export const KIND_LABELS = {
  platinum: 'Platinum',
  completion: '100% completion',
  story: 'Story',
  side: 'Side quest',
  collectible: 'Collectible',
  activity: 'Activity',
  crime: 'Crime',
  exploration: 'Exploration',
  money: 'Money',
  moment: 'One-off moment',
};

export const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

export function visibleTrophies(trophies, filters, earned) {
  const q = filters.q.trim().toLowerCase();
  const shown = trophies.filter((t) => {
    if (filters.kind !== 'all' && t.kind !== filters.kind) return false;
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (filters.status === 'earned' && !earned.has(t.id)) return false;
    if (filters.status === 'unearned' && earned.has(t.id)) return false;
    if (filters.missableOnly && t.missable !== 'possible') return false;
    if (filters.unconfirmedOnly && t.confidence !== 'unconfirmed') return false;
    if (q) {
      const hay = `${t.name} ${t.description} ${t.guide} ${(t.steps || []).join(' ')} ${t.target}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  return sortTrophies(shown, filters.sort);
}

export function sortTrophies(list, sort) {
  const copy = [...list];
  if (sort === 'easiest') {
    copy.sort((a, b) => (a.difficulty - b.difficulty) || ((a.hours || 0) - (b.hours || 0)) || (a.phase - b.phase) || (a.id - b.id));
  } else if (sort === 'name') {
    copy.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'grade') {
    copy.sort((a, b) => (GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade]) || (a.id - b.id));
  } else if (sort === 'chapter') {
    copy.sort((a, b) => ((a.chapter ?? 99) - (b.chapter ?? 99)) || (a.id - b.id));
  } else {
    copy.sort((a, b) => (a.phase - b.phase) || ((a.chapter ?? 99) - (b.chapter ?? 99)) || (a.id - b.id));
  }
  return copy;
}

// Next Up: the cheapest unearned trophies, story excluded (the story comes
// when it comes) and unconfirmed triggers pushed behind confirmed ones of
// the same difficulty — the planner should never send you chasing a trophy
// nobody has pinned down yet while a confirmed one of the same difficulty
// is open. Ranked by difficulty, then confirmed-before-unconfirmed, then
// hours, then roadmap phase, so the top of the list is always the easiest
// certain win still open. Each entry carries its reason in plain words.
export function nextUp(trophies, earned, count = 5) {
  const open = trophies.filter((t) => !earned.has(t.id) && t.kind !== 'story' && t.kind !== 'platinum');
  const unconfirmed = (t) => (t.confidence === 'unconfirmed' ? 1 : 0);
  open.sort((a, b) => (a.difficulty - b.difficulty) || (unconfirmed(a) - unconfirmed(b)) || ((a.hours || 0) - (b.hours || 0)) || (a.phase - b.phase) || (a.id - b.id));
  return open.slice(0, count).map((t) => ({
    trophy: t,
    why: reasonFor(t),
  }));
}

export function reasonFor(t) {
  const bits = [];
  bits.push(`Difficulty ${t.difficulty}/5`);
  if (t.hours) bits.push(`about ${t.hours}h`);
  else bits.push('no grind — part of normal play');
  if (t.missable === 'possible') bits.push('do it before leaving Chapter 1');
  if (t.confidence === 'unconfirmed') bits.push('trigger not yet confirmed — check sources');
  bits.push(`roadmap phase ${t.phase}`);
  return bits.join(' · ');
}

// Totals for the dashboard: earned Gamerscore, hours left, missable and
// unconfirmed counts, and per-grade earned/total pairs.
export function dashboardTotals(trophies, earned) {
  const gs = trophies.filter((t) => earned.has(t.id)).reduce((s, t) => s + t.gamerscore, 0);
  const hoursLeft = trophies.filter((t) => !earned.has(t.id)).reduce((s, t) => s + (t.hours || 0), 0);
  const grades = {};
  for (const g of ['platinum', 'gold', 'silver', 'bronze']) {
    grades[g] = {
      done: trophies.filter((t) => t.grade === g && earned.has(t.id)).length,
      total: trophies.filter((t) => t.grade === g).length,
    };
  }
  return {
    done: earned.size,
    total: trophies.length,
    gs,
    hoursLeft,
    missableDone: trophies.filter((t) => t.missable === 'possible' && earned.has(t.id)).length,
    unconfirmedLeft: trophies.filter((t) => t.confidence === 'unconfirmed' && !earned.has(t.id)).length,
    grades,
  };
}
