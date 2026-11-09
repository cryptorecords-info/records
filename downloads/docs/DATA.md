# Editing the BibTeX and JSON record book

The website has no application database, account layer, OAuth, sessions, comments or write API. Literature lives in standard BibTeX and result data in ordinary, version-controlled JSON. The build validates relationships and prepares fully precompiled HTML for GitHub Pages or any static web host.

Inclusion does not require a new best time exponent. A new technique, better memory, a stronger guarantee or a subexponential improvement is a relevant contribution. Store its own bound and source/version date, and explain the contribution in `notes`. Record status is computed from comparable bounds and dates, never stored as an editorial flag.

The [editorial controls guide](EDITORIAL.md) explains which scientific data people edit and which pages the build generates.

## Canonical files

| File | Meaning |
| --- | --- |
| `data/site.json` | Site identity, repository link and aliases preserving retired category/result URLs. |
| `data/problems.json` | Top-level problems and their subject families. |
| `data/categories/<categoryId>.json` | Overlapping comparison categories, free tags, regimes, cost notation and custom result fields. |
| `data/papers.bib` | Authoritative bibliography: paper titles, authors, publication year, URL/DOI and catalogue metadata. Citekeys are stable paper IDs. |
| `data/paper-notes/<paperId>.json` | Optional checked citation trails and version notes; no repeated title/authors/URL. |
| `data/records/<categoryId>.json` | Results belonging to one category; each references a paper. |
| `data/records/<categoryId>/0001.json`, etc. | Optional source chunks for large categories. Use these instead of the flat category file, never both with duplicate results. |
| `schemas/*.schema.json` | Editor-friendly JSON Schema definitions. The build also performs cross-file and scientific-metadata checks. |

Papers are stored separately because a paper may give several results in several categories. Correcting an author, article URL or bibliography requires one source change. The full source title and author names are the displayed identity of every result. The build derives result, chart and detail titles from `paper.title`; legacy `record.title` values are ignored. Do not invent or maintain separate algorithm names.

## BibTeX metadata

Use standard `author`, `title`, `year`, `url` (or `doi`), `journal`, `booktitle`, `school`, `keywords`, and other bibliographic fields. UTF-8 names are recommended. Standard braces, quoted values, string macros, `#` concatenation and checked `crossref` inheritance are supported; the parser never executes TeX. A missing required field, duplicate key, undefined macro or dangling/circular cross-reference fails validation.

| Optional field | Meaning / default |
| --- | --- |
| `cr_date` | Source date for the paper; absent means conservative `year-12-31` |
| `cr_date_precision` | `year`, `month` or `day`; missing source date implies `year` |
| `cr_status` | `published`, `preprint`, `draft` or `unverified`; scholarly publication entry types default to `published`, `misc` to `preprint` |
| `cr_venue` | Explicit catalogue venue when standard venue fields do not capture it |
| `cr_venue_short` | Optional exact compact publication label, such as `Eurocrypt 2025`; no page range |
| `cr_author_ids` | Stable author IDs separated by semicolons, in author order; omitted IDs are derived from full names |
| `cr_orcids` | Optional ORCID IDs separated by semicolons in author order |

Unknown ordinary BibTeX fields are retained for export. Existing IDs are preserved by the migration. Keep a key stable when correcting its metadata. An individual BibTeX export includes the fields needed to use it independently. Only `references` and `versionNote` belong in a paper annotation JSON; all bibliographic corrections go in the `.bib` file.

## Result fields

| Field | Meaning |
| --- | --- |
| `id` | Stable result ID, retained when correcting metadata. Used by public record links. |
| `categoryId`, `paperId` | References to the comparison contract and scholarly evidence. |
| `year`, `date`, `datePrecision` | Reference/publication year, historical date when the specific bound became available, and optional `year`/`month`/`day` precision. Conference year can differ from the date of a preprint or corrected version. |
| `evidence` | Optional primary-source `url`, `locator` (theorem, table, page or section), and `sourceVersion`. Compiled into the separate record-detail page, not every list row. |
| `time`, `space` | Numeric leading `coefficient` plus exact human-readable `expression`. A missing numeric score is `null`, not zero. Cost normalization is defined by the category. |
| `tags` | Free tags attached to this particular result. Category tags describe the entire list. |
| `review.status` | `unreviewed`, `source-checked`, `reviewed`, or `disputed`. |
| `review.reviewer`, `reviewedAt`, `reviewerOrcid` | Optional editorial provenance; not website accounts. |
| `certificate.status` | Reserved metadata, retained for format compatibility. Use `not-provided` for new entries. |
| `certificate.lean` | Reserved metadata. Use `null` for new entries. |
| `notes` | Assumptions, theorem references, parameter conventions and source/version caveats. |
| `extra` | Named per-category values, such as sample complexity or coherent-memory access. |

`paper.publication.status` records `published`, `preprint`, `draft`, or `unverified`. `source-checked` means the cited source was checked for the attributed bound. Preserve existing reserved metadata when updating a record.

## Dates and comparison scores

Use the date of the specific bound or source version, not a later journal year. Omitted `datePrecision` means day precision. When only a year or month is known, state that precision and use a conservative end-of-period cutoff (`YYYY-12-31` or the month's last day) rather than inventing an early exact release date. A coarse date does not establish the ordering of results within that period.

The numeric time coefficient is comparable only within its category's explicit cost normalization, such as `2^{c n + o(n)}` or `L_N[1/3,c]`. Store a non-comparable or expression-only result with `time.coefficient: null`; it receives no numeric rank and does not enter the record-breaker chart. Polynomial-time, quasi-polynomial-time and parameter-dependent expressions must not be assigned a fabricated exponent. Empirical challenge sizes are not time exponents and require a separate future metric model.

## Family, problem and variant navigation

Each problem's `group` is its family display label, and optional `familyId` is its stable family identity. Categories are variants belonging to a problem through `problemId`; tags remain orthogonal and may overlap. This produces three navigation layers without forcing all assumptions into a rigid taxonomy.

Choose categories as deliberate comparison contracts, not automatically from paper titles or individual constants. Approximation factors such as 1.97 for CVP and 1.93 for GapSVP belong in result parameters under broader approximate-search or approximate-decision lists. When factors vary, keep the time expression but use a null comparable coefficient; `extra.timeExponentAtStatedGuarantee` may preserve the numeric exponent at the stated guarantee. Fixed budgets can justify separate lists when they serve an explicit comparison purpose. Site aliases preserve retired public IDs after a consolidation.

The generator emits family and problem HTML pages, then paginated comparison lists. Ordinary links connect them. List pages contain their own result table; the separate History page contains the step plots and other result markers. No generated JSON index or browser database is needed to read a result list.

## Authors and later search

Each paper author has a stable `id`, readable `name`, and optional `orcid`. These are bibliographic identifiers, not user profiles. Names can later gain aliases or ORCID identifiers without changing result IDs. `paper.keywords`, result/category tags and full paper titles support a future offline search-index build. No full-text or author index is fetched during normal browsing.

## Tracing earlier literature

Optional `paper.references` contains selected checked citation links: `{paperId, locator, relationship}`. These identify the earlier paper, where it is cited in the referring source, and what comparison the citation supports. They are a selected historical trail, not a claim to reproduce the complete reference list. The build rejects dangling paper IDs and resolves each link to the cited paper's title, authors, year and URL. These details are compiled only into the corresponding record-detail pages.

Research-import bundles can supply `citationEdges` as `{fromPaperId, toPaperId, locator, relationship}`. The importer resolves bibliographic aliases before saving the references. A survey repeating an older constant is evidence of historical attribution; a revised analysis must keep its own version date and must not silently transfer that constant to the original algorithm's publication year.

## Typical changes

1. Add or edit a BibTeX entry in `data/papers.bib` with the real title/authors and primary-source URL.
2. Add a result in the category's records JSON, referring to that paper ID.
3. Use an existing meaningful category where possible. If the comparison contract differs, decide whether it warrants a separate list or belongs as an unranked, explicitly parameterized result; use tags for overlapping properties.
4. Run `npm run validate`, `npm test`, then `npm run build`.
5. Review the JSON/code diff and commit it. GitHub Actions validates and deploys the static output.

Do not edit `dist/`: it is regenerated. IDs permit letters, numbers, underscores and hyphens; they cannot contain path separators. The build rejects duplicate IDs, missing papers/categories, invalid dates, nonfinite coefficients, unsafe URLs and incomplete evidence.

For large source files, `node scripts-static/shard-records.mjs 250` splits any category with more than 250 results into reviewable JSON source chunks. It does not change public IDs or the generated HTML pagination. Run validation before committing the split.

`node scripts-static/import-legacy-json.mjs additions.json` can merge an old Dataset-shaped JSON document (`problems`, `boards`, `entries`) into canonical files. It is an optional conversion utility, not a runtime dependency. Ordinary maintenance should edit the canonical format directly.

## Generated routes and downloadable data

The build emits `lists/<category>/index.html`, further table/history pages, `records/<record>/index.html`, and family/problem navigation. These files contain the actual visible content before any JavaScript runs. Optional filtering works on the currently displayed table only and says so explicitly.

The downloads directory offers the canonical `papers.bib`, per-list JSON/CSV, individual result JSON and BibTeX, and `data.zip` containing the canonical data, schemas and maintenance guides. The ZIP is generated offline one source file at a time, without fetching publications. No user-submitted text runs as code during rendering; text is escaped into HTML and scientific URLs are restricted to HTTP(S).

## Historical comparisons

`history/index.html` is the standalone multi-category comparison view. Its compact series and category-discovery indexes are generated from the same canonical data and comparison contracts. Only strict, eligible numeric improvements enter each step line. Other eligible numeric results, including ties and memory tradeoffs, are marked separately as hollow diamonds at their own dates and coefficients. Draft/disputed and expression-only rows stay available in the source tables without chart markers. Selecting several series does not combine their claims into a new overall record.

The **Show other results** control defaults to on; shared URLs use `results=records` for an envelope-only view. Hiding these markers does not recompute or otherwise change the envelope. A carried boundary value is a rendering aid, never a new publication marker. The classification identifies a change in the best listed bound, not a claim of historical priority between papers sharing a coarse source date.

A shared axis requires the same declared metric, parameter and direction. Family/problem names and model assumptions remain with every selected category. The browser loads only the chosen histories and the currently explored problem's category pages. Source dates remain scientific dates, including their precision; clipping a series to a display range does not create a new publication event.
