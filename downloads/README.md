# CryptoRecords.info — precompiled edition

An open bibliographic catalogue of cryptanalytic complexity bounds. A deterministic offline generator turns BibTeX and modular JSON into ordinary HTML for GitHub Pages. Leaderboard tables and record details require no JavaScript, runtime database, account or global research index. A separate History page compares selected categories using small precomputed static history files.

Browse **family → problem → comparison variant** using the topic sidebar and one category selector per list. Papers retain their actual titles and full authors. Each variant fixes the assumptions and cost scale; ranks and historical plots use comparable results. Publication and source-checking status are recorded separately.

The collection includes relevant asymptotic results even when they did not set a time record. Alternative techniques, memory improvements and subexponential improvements belong in the same editable literature/result data. The best-bound line and other numerical results are derived automatically from those entries.

## Build and preview

Requires **Node.js 22+**, with no npm dependencies or installation step:

```sh
npm run validate
npm test
npm run build
npm run dev
```

`dist/` is the complete published website. `npm run build` regenerates every list from local data, writes only changed output locally and removes obsolete generated pages. A fresh GitHub Actions runner performs a complete build. `SOURCE_DATE_EPOCH` controls the release date for reproducible output; scientific dates come from source data.

## Editorial controls

Branding and old-link aliases are configured in `data/site.json`. The problem/category definitions, bibliography and result data are curated by people; the build derives pages, numeric ranks and history lines. Structural validation does not establish mathematical correctness. See [what is editable and what is generated](docs/EDITORIAL.md). A compact publication venue appears next to each paper; optional BibTeX `cr_venue_short` overrides its display without changing the complete citation.

## Canonical source data

| Source | Edit here |
| --- | --- |
| Literature | `data/papers.bib` — one normal BibTeX entry per paper; citation keys are stable paper IDs |
| Results | `data/records/<category>.json` — formatted JSON arrays; large lists may use `<category>/*.json` chunks |
| Comparison rules and tags | `data/categories/<category>.json` |
| Problems and families | `data/problems.json` |
| Selected citation trails and version notes | Optional `data/paper-notes/<paper-key>.json`; no duplicated bibliography |
| Repository link | `data/site.json`; GitHub Actions uses its actual `GITHUB_REPOSITORY` automatically |

The build rejects invalid bibliography, duplicate keys/record IDs, missing references, invalid dates and inconsistent evidence. Record titles are always derived from the BibTeX source; do not invent separate algorithm names. See [the data reference](docs/DATA.md) and [contribution examples](CONTRIBUTING.md).

## GitHub Pages and community review

1. Put the source in the intended public GitHub repository on `main`.
2. Set **Settings → Pages → Source: GitHub Actions**.
3. Adapt `.github/CODEOWNERS.example` with real maintainers/teams, save it as `.github/CODEOWNERS`, and protect `main` with required reviews and the `build` status check.
4. Community members edit BibTeX/JSON in a fork and submit a pull request. CI validates, tests and builds the proposal without publishing it.
5. After approval and merge, the included workflow rebuilds and publishes the HTML artifact.

A shared organization is convenient for subject teams. CODEOWNERS routes reviews; it does not confine a collaborator's write permissions to a directory. The [community operating guide](docs/COMMUNITY.md) explains review enforcement, setup and hosting limits. The files in this repository do not themselves enable Pages, create teams or apply branch protection.

All links are relative to the site root, so both `USERNAME.github.io/REPOSITORY/` and custom domains work. Generated routes include `lists/svp-provable/`, `records/hkkl26/` and `problems/svp/`. Old `?category=...` and `?record=...` bookmarks redirect through a small optional script.

The existing `.openai/hosting.json` configures the current static preview host only. It is unnecessary for GitHub Pages and declares no database/storage binding.

## Downloads and scale

The published **Data & downloads** page offers the full `papers.bib`, a source-data ZIP and per-list JSON/CSV; record details offer individual JSON and BibTeX. These are generated files, not a second hand-maintained database. Source data and changes are also downloadable through the repository.

HTML tables and archived single-category histories are paginated. A visitor downloads their selected page, a shared stylesheet and a small optional enhancement script; no bibliography-wide payload grows with the total database. Full record notes and bibliography live on separate static detail pages. See [measured generation and hosting budgets](docs/PERFORMANCE.md).

```sh
npm run benchmark:static -- 100000 1000
```

This explicitly synthetic test measures generation for 100,000 rows spread over 1,000 lists, excluding filesystem/network latency. No synthetic records are published. The older `npm run benchmark` exercises the retained JSON-export compiler rather than the active HTML route.

Large editable lists can be split with `node scripts-static/shard-records.mjs 250`. `node scripts-static/merge-research.mjs bundle.json` remains an optional offline research import utility. Detailed scientific provenance is retained in [the research notes](docs/research/README.md). Do not edit or commit `dist/`.

## Comparing record histories

Open **History** in the main navigation to overlay selected category histories. Each category retains its own envelope, computation model, assumptions and source links. Compatible cost scales share a panel; different scales are shown separately. Changing the date range carries forward the bound already known at the left boundary and never invents a pre-discovery value or linearly interpolates an improvement.

Circles mark strict historical improvements; hollow diamonds mark other eligible numerical results, including ties. **Show other results** is enabled initially and can be switched off to focus on the best-bound lines. Marker coordinates use the result's own source date and exponent, with links to its full source details. Date/visibility selections are included in the comparison link.

The default comparison is pre-rendered. Interactive selections use a dedicated page script and fetch only the selected compact histories and the current problem's paginated category metadata. No full record database or bibliography is loaded for comparison. Leaderboard pages remain ordinary precompiled HTML. Old per-category history URLs remain available for existing bookmarks.
