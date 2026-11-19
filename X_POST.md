# Post on X — gta6-trophy-guide-02

**Status: NOT YET POSTED — waiting for the user to post it.**
The play code could not be fetched yet: the make.fun API answers
`no competition gta6-trophy-guide-02` for the play-code endpoint (and for
the requirements endpoint) even though the bounty page is live — the
competition has not been seeded into the API yet. Do NOT post with a made-up
code. Fetch the real code first (see below), paste it into the post text,
post, then put the post's address in POST.json and resubmit.

## How to get the real play code (once the API seeds the competition)

```sh
node -e "
const fs=require('node:fs');
const d=JSON.parse(fs.readFileSync(process.env.HOME+'/.makefun/credentials','utf8'));
const key=d.keys['https://make.fun'].key;
(async()=>{
  const r=await fetch('https://make.fun/api/competitions/gta6-trophy-guide-02/play-code',{headers:{'x-api-key':key}});
  console.log(await r.text());
})();
"
```

The answer is `makefun-` plus three words, e.g. `makefun-oak-river-lantern`.
Use code 0 (no `?n=`); `?n=1`, `?n=2`, `?n=3` give the other three codes and
any one of them passes.

## Post text (English, copy-paste exactly, replacing ONLY the play code)

> I built Leonida Ledger — an offline GTA 6 trophy guide & tracker for all 55 PS5 trophies: saved checklist, a Next Up planner, a platinum roadmap, missable warnings, and a cited step-by-step guide for every trophy. Built for a make.fun bounty paying $250 in real rewards: https://make.fun/bounty/gta6-trophy-guide-02
>
> @makefunai
>
> Play code: makefun-XXX-XXX-XXX

Notes on the text:
- It says what was built and that it is a make.fun bounty paying real money.
- It carries make.fun as a link to the bounty's page AND the @makefunai tag
  (either one alone would pass; both are in).
- It carries the play code exactly as issued (`makefun-` + three words).
- Attach the cover screenshot as the first picture: `screenshots/1-cover.jpg`
  (1280x800 render of the guide). A post with no picture, or only a GIF or
  video, is refused.

## How to post (step by step)

1. Open X in a browser, signed in to a PUBLIC account (Settings → Privacy
   and safety → Audience → "Protect your posts" OFF).
2. Click New post. Paste the text above with the REAL play code filled in.
3. Attach `screenshots/1-cover.jpg` as the first picture (you may add the
   other screenshots too).
4. Post it. It must be posted between the bounty's opening (19 Nov 2026
   21:00 +07) and its deadline (21 Nov 2026 21:00 +07).
5. Click the post's Share button → Copy link. The link looks like
   `https://x.com/<handle>/status/<digits>`.
6. Write that address into `POST.json` in this repo as
   `{"url": "https://x.com/<handle>/status/<id>"}` — then commit and the
   entry can be resubmitted with the real post before the deadline.
7. Keep the post up and the account public until the results are out.

## Screenshot for the post

`screenshots/1-cover.jpg` — the tracker with 13 of 55 trophies earned, the
Positive Mental Attitude guide open with its sources, filters and the
spoiler setting visible, progress ring and dashboard on top.
