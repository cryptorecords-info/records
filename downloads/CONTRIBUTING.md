# Contributing literature and results

Suggest additions, corrections or removals through a GitHub pull request. Browsing and downloading the published collection require no account. GitHub handles contributor identity and review; the website has no user database.

Results need not set a time record. Include relevant asymptotic contributions such as a different algorithmic technique, reduced memory, a stronger guarantee, or an improvement below the leading exponential term. Explain the contribution and its assumptions in `notes`, with a source locator. A result that only repeats an earlier bound without a new contribution does not need a duplicate entry. Do not add a manually maintained record/non-record field: the generator derives historical improvements from dates and comparable coefficients.

The History page shows the best known bound as a step line and other eligible numerical results as separate diamonds. Tied bounds do not change the line. Non-numeric expressions remain in the result lists and source pages; they are not assigned a made-up coordinate.

## The files to edit

| Change | Source |
| --- | --- |
| Add or correct a paper | `data/papers.bib` |
| Add or correct a complexity result | `data/records/<category-id>.json` |
| Update a checked citation trail or source annotation | The matching file in `data/paper-notes/` |
| Add a comparison regime | `data/categories/<category-id>.json` |
| Add a problem or family | `data/problems.json` |

The bibliography is authoritative for paper titles, authors and bibliographic fields. A result's `paperId` identifies its stable bibliography key. Do not add a separate result title or rename an existing paper key just to make it prettier: other entries may reference it. See [the data reference](docs/DATA.md) for supported BibTeX metadata and optional annotations.

See [editorial controls](docs/EDITORIAL.md) for which settings are manual and which values the build derives. Categories are curated comparison contracts; a paper's particular approximation factor does not automatically become a new list. Store differing factors in result parameters, and leave the comparable coefficient null when a shared ranking would compare different tasks.

A new paper starts with a normal BibTeX entry. This illustrative entry is not part of the catalogue:

```bibtex
@misc{example-paper-key,
  author = {First Author and Second Author},
  title = {The actual paper title},
  year = {2026},
  url = {https://example.org/paper.pdf},
  cr_date = {2026-11-08},
  cr_date_precision = {day},
  cr_status = {preprint}
}
```

The required bibliographic fields are `author`, `title`, `year`, and `url` (or `doi`). Use UTF-8 author names. If the source date is omitted, the loader uses year precision; an exact date should only be supplied when supported by the source. Optional `cr_` fields carry catalogue metadata without duplicating the bibliography elsewhere. Checked citation trails live in `data/paper-notes/<paper-key>.json`.

Record the actual publication venue when known, keeping its year separate from the first preprint/source date. Ordinary `booktitle` and `journal` fields are preferred for the bibliographic record; `cr_venue` can clarify the venue, and `cr_venue_short` can provide the exact short label shown next to the paper, for example `PKC 2020`. Keep page numbers in the normal bibliography fields rather than the short label. For an unpublished source, retain its preprint status and archive reference instead of guessing a conference.

Each list is a formatted JSON array. An ordinary editor or GitHub's file editor is sufficient. Keep existing indentation, and append a new object or change the identified object. For a large list, the loader also accepts `data/records/<category-id>/*.json` chunks; do not keep both a complete original file and duplicate chunks.

## A result example

This is an illustrative schema example, not an actual scientific claim. Replace the sample key and source with a real paper already present in `papers.bib`, and use an existing comparison category. A numeric coefficient is meaningful only on that category's declared cost scale.

```json
{
  "id": "example-svp-result",
  "categoryId": "svp-provable",
  "paperId": "example-paper-key",
  "date": "2026-11-08",
  "datePrecision": "day",
  "time": {"coefficient": 1, "expression": "2^{n+o(n)}"},
  "space": {"coefficient": null, "expression": "Not established by the cited passage"},
  "tags": ["classical", "provable"],
  "evidence": {
    "url": "https://example.org/paper.pdf",
    "locator": "Theorem 1",
    "sourceVersion": "Version containing the quoted bound"
  },
  "review": {"status": "unreviewed"},
  "certificate": {"status": "not-provided", "lean": null},
  "notes": "State the input promise, success probability, preprocessing and other necessary conditions.",
  "extra": {}
}
```

Use `coefficient: null` with the full expression for parameter-dependent costs or a nonnumeric bound. A missing space analysis is not zero space. Do not put different sample regimes, preprocessing/query models, lattice promises or approximation factors on one leaderboard merely because the exponents look comparable.

Use the earliest verified source version that contains this particular bound. A journal year, conference date and first public preprint date may differ. Use year/month precision when an exact day is unknown. Include the theorem or table locator in `evidence`; explain a retrospective attribution when the original cannot be checked.

`source-checked` means the cited source was checked for the attributed result. Preserve existing review metadata when correcting an entry. The `certificate` object is reserved metadata; use `{"status": "not-provided", "lean": null}` for new entries.

## Local checks and publication

Use Node.js 22 or later. The generator needs no online paper lookup.

```sh
npm run validate
npm test
npm run build
npm run dev
```

Submit changes to source data and any supporting explanation. Do not commit generated `dist/` pages. Pull-request CI validates the bibliography, cross-references and models, runs the tests, and precompiles the website. It does not publish the proposal. A moderator reviews the evidence and comparison regime; after merge to `main`, GitHub Actions rebuilds and publishes GitHub Pages.

For a correction or removal, mention the stable record ID and reason in the pull request. Git history keeps the previous text. Mark a disputed attribution explicitly while it is being resolved; a syntactically valid JSON edit is not by itself an approval of the mathematics.

Maintainers should follow [community review and repository setup](docs/COMMUNITY.md).
