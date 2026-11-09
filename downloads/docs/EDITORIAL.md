# Editing CryptoRecords.info

People curate the scientific catalogue. The compiler turns its bibliography, bounds and comparison rules into static pages.

## What is edited by hand

| Decision | Source file | Examples |
| --- | --- | --- |
| Site identity and links | `data/site.json` | `brandName`, `displayDomain`, `tagline`, `description`, `repositoryUrl` |
| Families and computational problems | `data/problems.json` | Family, problem name, acronym and description; their order also determines the family/problem browsing order |
| Comparison categories | `data/categories/<id>.json` | Name, computation model, rigor, instances, parameter regime, metric, direction, rules and tags |
| Variant ordering | Category `featured` flag | Places established variants first in category selectors |
| Paper identity and publication | `data/papers.bib` | Real title, authors, venue, publication year, first-source date, URL and status |
| A particular algorithmic bound | `data/records/<category>.json` | Time/space expressions and comparable coefficients, source-version date, assumptions, evidence location and additional parameters |
| Source-checking status | Each result's `review` | Whether the attribution was checked or a claim is disputed |
| Checked citation trails | `data/paper-notes/<paper-id>.json` | References to earlier sources and version caveats |
| Old links after a merge | Site `categoryAliases` and `recordAliases` | Retired IDs mapped to their retained category or result |

Changing `displayDomain` changes the displayed identity. Domain registration, DNS and host configuration are separate settings outside the scientific dataset.

The bibliography provides both the publication venue/year and the historical source date. A 2014 preprint later published at Crypto 2015 can therefore show **Crypto 2015** next to the paper while its result remains dated 2014. Use `booktitle` or `journal` for normal bibliographic metadata, `cr_venue` when the catalogue needs an explicit venue, and optional `cr_venue_short` for an exact compact display label such as `Eurocrypt 2025`. Page ranges belong in the bibliography, not in that short label. An unknown conference is not inferred from an ePrint URL.

## What is derived automatically

The build validates BibTeX syntax, IDs, dates, cross-references, URLs and required metadata. It compiles the navigation, static tables, source-detail pages, publication labels, counts, downloads and compact history/category indexes. It generates numeric ranks and ties from the declared comparison metric. Each history step line follows strict improvements among eligible numerical results; other eligible results become separate markers. Nobody maintains a second list of “record holders”.

These calculations use the entered scientific data and comparison rules. Structural validation catches formatting and reference errors. `source-checked` means the cited source was checked for the attributed statement.

The homepage groups problems by family. Within a problem, variants are ordered by `featured`, then result count, then name. The History picker uses `featured`, then the number of strict improvements, then name.

## Choosing categories

Use categories for stable comparison contracts that readers want to browse: classical or quantum computation, exact search or approximate decision, worst-case or heuristic instances, preprocessing/query costs, sample regimes and explicit resource budgets. A new paper or a new decimal constant does not automatically justify another category.

For example, **1.97-approximate CVP** is a guarantee of a result in the approximate Euclidean CVP literature. It is stored with the result's approximation parameters under the broader approximate-search category. The same principle applies to **1.93-GapSVP**, while retaining the distinction between decision and search. If approximation factors vary across the list, their time coefficients cannot be ranked as though they solve the same task. Keep the complete time expression, put `time.coefficient: null`, and retain any stated numerical exponent in `extra.timeExponentAtStatedGuarantee`. Such a row stays readable and downloadable without acquiring a misleading rank or graph coordinate.

A fixed-factor or fixed-memory list can still be useful when it defines a deliberate community comparison. The requirement is an explicit, meaningful contract, not a category for each paper's chosen parameter. When merging duplicate categories, retain useful result IDs and source evidence, and add aliases for removed public IDs.

## Changes that require code

Colours, fonts and spacing live in `website/*.css`. The shell, table columns and page text are rendered by `scripts-static/precompile.mjs`; the History interface lives in `website/history.js` and `scripts-static/history-explorer.mjs`. The default History selection and pagination/marker budgets are code-level choices. A category's `fields` declaration controls labels for its additional values on source-detail pages; it does not create arbitrary new table columns. The values also remain in the data exports.

There is currently a filter for the displayed page, not a whole-database author or full-text search. The author IDs, keywords and source metadata are available for a future search-index build. Changing the data is enough to update the existing pages and indexes; adding new search behaviour requires implementation.

## Correction workflow

Edit the canonical BibTeX/JSON, identify the source theorem/table and version, then run `npm run validate`, `npm test`, `npm run build` and `npm run check:output`. Review the source diff and submit a pull request. Never repair a generated `dist/` page directly: the next build replaces it. Automated checks support the human review; they do not approve the mathematics. See [the data reference](DATA.md) and [contribution guide](../CONTRIBUTING.md).
