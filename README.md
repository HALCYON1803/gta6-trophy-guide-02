![GTA 6 trophy guide](https://make.fun/badge/gta6-trophy-guide-02.svg)
[![Rank](https://make.fun/badge/gta6-trophy-guide-02/HALCYON1803/gta6-trophy-guide-02/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-02)
[![Reward](https://make.fun/badge/gta6-trophy-guide-02/HALCYON1803/gta6-trophy-guide-02/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-02)

# Leonida Ledger — GTA VI Trophy Guide & Tracker

An offline guide and tracker for all **55 Grand Theft Auto VI trophies on PlayStation 5** — 1 Platinum, 2 Gold, 6 Silver, 46 Bronze, 28 hidden, none online. Built for the [gta6-trophy-guide-02 bounty](https://make.fun/bounty/gta6-trophy-guide-02) on make.fun.

## What it does

- **Tracker** — tick trophies off as you earn them. Progress is saved in the browser (localStorage), survives reloads, and can be exported to a file and imported back. A dashboard shows the progress ring, Gamerscore (of 1,000G), estimated hours left, and per-grade bars.
- **Next Up planner** — ranks your unearned non-story trophies by difficulty, then hours, then roadmap phase, with a plain-words reason for each pick, so the next thing you do is always the easiest win still open.
- **Every trophy, with a guide** — official name, description and grade as PlayStation publishes them, plus numbered steps and a guide in this entry's own words: what to do, where, and whether it can be missed. Every guide cites its sources by name and link.
- **Platinum roadmap** — six phases in play order (story, Strangers & Freaks, activities, collectibles, crime spree, money and cleanup), with per-phase progress and progress by story chapter. About 200 hours in total (PowerPyx estimate).
- **Missables** — exactly one trophy is possibly missable: Positive Mental Attitude (the Chapter 1 meditation spot). The other 54 cannot be missed. The guide says so plainly, with the manual-save habit that protects you.
- **Filters & spoilers** — search, filter by kind, grade and status, sort by roadmap order / easiest / name / grade / chapter, missable-only and unconfirmed-only views, and a spoiler setting that hides the 28 hidden trophies until earned.
- **Personal notes** — add a note to any trophy (saved with your progress) and copy a one-line progress summary to share.
- **Honest about what is not known yet** — five trophies whose exact triggers no guide has pinned down yet (In The Beginning…, Capital Offense, Bad Luck I Guess, The Truth Is Out There, Ten Pin) are marked **unconfirmed** instead of inventing steps.
- **Fully offline** — static files under `app/`, no CDN, no web fonts, no network requests at run time. Open `app/index.html` in desktop Chrome with the network off and it works.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

Or serve `app/` with any static file server. Press `/` to jump to search.

## Files

- `app/index.html`, `app/css/theme.css`, `app/js/boot.js`, `app/js/store.js`, `app/js/filters.js`, `app/js/views.js` — the guide itself.
- `app/data/trophies.json` — the 55 trophies: official name, description, grade, Gamerscore, hidden flag, kind, chapter, missable flag, difficulty, time estimate, roadmap phase, numbered steps, guide and sources.
- `main.ts` — the entry program: copies `app/` and `screenshots/` to `/output` and writes `dossier.json`.
- `screenshots/` — real renders of the app in a browser (see `shots.json`).
- `SOURCES.md` — every source used, and what each fact rests on.
- `X_POST.md` — the text of the public post on X about this guide (see below).
- `POST.json` — the address of that post, once it is up.

## The post on X

This bounty requires a public post on X about the guide, with a screenshot of it, make.fun (a link or written out) and/or a tag of @makefunai, and the entrant's play code. The exact post text is in `X_POST.md`. The post is made from a public X account after the bounty opens and before its deadline; once it is up, its address goes in `POST.json`.

## Sources

Trophy names, descriptions and grades: PlayStation Network, as mirrored by Exophase and PSNProfiles (18 Nov 2026) and cross-checked with TrueAchievements. Guide steps, counts, difficulty, time and the missable call: PowerPyx and GTABase, via GTA-Zone. Full list in `SOURCES.md`.

## Licence

MIT — see `LICENSE`. This is an independent fan-made guide, not affiliated with Rockstar Games, Sony or PlayStation, and it uses no Rockstar logo, artwork or game screenshots.
