# Community rankings (Stats → Everyone)

The Everyone screen and the "Done by N explorers" line read `web/community.json`. A GitHub Action
(`.github/workflows/community.yml`) rebuilds it every night at 03:17 UTC with `tools/community_stats.py`, which reads
every signed-in explorer's save with a Firebase admin key and writes only totals. The Publish workflow runs right after,
so the site updates on its own. Until the key is set up, the job does nothing and the app shows "Rankings are on their way".

## One-time setup (about five minutes)

1. **Create the key.** Firebase console → Project settings (gear) → *Service accounts* → *Generate new private key*.
   A JSON file downloads. Treat it like a password: it can read and write the whole database.
2. **Give it to GitHub.** On GitHub: the repository → *Settings → Secrets and variables → Actions → New repository secret*.
   Name: `FIREBASE_SERVICE_ACCOUNT`. Value: the whole contents of the JSON file. Then delete the file from your computer.
3. **Run it once.** *Actions → Community stats → Run workflow*. When it finishes, *Publish* runs and the totals are live.

## What gets published

- Only explorers who are signed in and have done at least one quest; anyone who turned off
  *Settings → Count me in the community rankings* (`profile.noStats`) is skipped.
- `MIN_COUNT` (counts below it are dropped) and `MIN_EXPLORERS` (nothing is published below it) are both 1 for now.
  Raise them once there are more explorers, so small counts can't point to one person.
- "Trending" counts quests done in the last 30 days.

Try it locally without writing anything: set `FIREBASE_SERVICE_ACCOUNT` to the key's JSON and run
`python tools/community_stats.py --dry-run` (needs `pip install firebase-admin`).
