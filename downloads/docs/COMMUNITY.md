# Community review and GitHub Pages

## Recommended operating model

Use one public repository owned by a GitHub organization. Give the community fork-and-pull-request access; appoint a few maintainers and subject teams for lattices, codes and other areas. All scientific changes enter through pull requests. Source data remains easy to download, cite and mirror without a website account.

The repository contains the publishing workflow and an **inactive** `.github/CODEOWNERS.example`. It does not create teams, grant permissions, enable Pages, or apply branch protection. Those settings must be configured on the actual repository by its owner. No moderator names or team memberships are invented here.

## Repository setup

1. Put the source in the intended shared repository with default branch `main`.
2. In **Settings → Pages**, select **GitHub Actions** as the publishing source. Restrict the `github-pages` environment to deployments from `main`.
3. Create real subject teams. Adapt `.github/CODEOWNERS.example`, save it as `.github/CODEOWNERS`, and check that GitHub recognizes every owner.
4. Protect `main` with a ruleset or branch protection: require a pull request, at least one independent approval, code-owner review, resolved conversations and the **build** status check from GitHub Actions. Dismiss stale approvals when the diff changes. Disable force-pushes and deletion, and avoid routine bypass permission.
5. Review a small test pull request before inviting broad contributions. Confirm that the relevant experts are requested, an invalid citation key fails CI, and publication runs only after merge.

These are setup instructions, not a claim that the remote settings have already been applied. GitHub documents the [Pages publishing-source setting](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) and [available ruleset controls](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets).

## What topic ownership enforces

CODEOWNERS routes review by file path. Owners need repository write access; an owning team must be visible and have explicit write access. The last matching rule applies, so a topic rule replaces the default owner. On one rule, several owners are alternatives: approval by one is sufficient. Protect the owner map and workflow files themselves. These rules need required code-owner reviews on the protected branch to gate merges. See [GitHub's CODEOWNERS specification](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners).

An approval must cover the changed owned files; a pull request spanning disjoint owner groups can need several reviews. A maintainer included in every rule can satisfy several groups, so including that maintainer everywhere weakens subject-specific delegation. Do not interpret CODEOWNERS as a per-directory permission system: topic experts with write access are trusted repository collaborators, not technically confined to their lists.

For an organization requiring a particular team in addition to other approval, GitHub's current ruleset controls also support **required reviewers** by file pattern. This can express a separate approval requirement per team; a rule can name up to 15 teams. This team-based option does not apply to user-owned repositories. Availability should be checked in the target organization's settings. See the [required-reviewer rule](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets#required-reviewers).

## What CI does

`pull_request` runs validate → tests → precompile with a read-only contents token. It does not deploy or access publication credentials. The workflow uses hosted runners, disables persisted checkout credentials, and has no `pull_request_target` or privileged follow-up consuming untrusted build artifacts. First-time fork contributors may need GitHub's approval to run CI; that approval is separate from scientific approval. Only `main` can upload and deploy the Pages artifact. These choices follow GitHub's [secure-use guidance](https://docs.github.com/en/actions/reference/security/secure-use).

A passing build verifies format, references and generation. It does not verify the proof of a claimed exponent. The reviewer still checks the source version, theorem, assumptions, cost normalization, sample count, memory model and chronology. Pull-request descriptions provide a durable explanation of acceptance or rejection; the displayed review metadata should describe the scientific review that actually took place.

## Managing many lists and contributors

This arrangement works well for a literature catalogue because reading is much more frequent than editing. Visitors read precompiled HTML for their selected list, without downloading the whole bibliography or running a client-side database query. Full regeneration is an offline operation; unchanged generated content can be retained locally, while a fresh Actions runner still performs a complete deterministic build.

Modular result files let unrelated subject teams edit independently. Stable IDs prevent papers and records from being renamed by a routine metadata update. Keep the shared taxonomy small enough to review centrally. Split unusually long list files into chunks before they become awkward to edit; use neutral chunk names so an improved exponent does not force unrelated records into another file.

A single `papers.bib` is convenient for download and standard bibliography tools, but it is a shared editing hotspot. Concurrent additions can conflict near the same location, and a bibliography-wide owner can become a review bottleneck. Small pull requests and consistent ordering help. If that becomes frequent, extend the loader to ingest topic-sharded `.bib` files and generate the single download from them; do not keep two manually maintained copies. The current canonical source remains `data/papers.bib`.

The eventual scale limit is generated output and build/deployment cost, not just the number of editable JSON files. Record pages repeat some bibliographic content and each file adds upload overhead. Measure the actual published bytes, file count and build duration as the collection grows. If they approach the hosting budget, keep bounded list pages, move bulky research attachments out of the site, or change hosting while retaining the same open source-data format.

## GitHub Pages limits

Checked against official documentation on **8 November 2026**:

| Limit | Current documented value |
| --- | --- |
| Published site | At most 1 GB |
| Source repository | Recommended at most 1 GB |
| Pages deployment | Times out after 10 minutes |
| Bandwidth | Soft limit of 100 GB per month |
| Builds | Soft limit of 10 per hour; custom Actions build-and-publish workflows are exempt from this limit |

The custom workflow exemption does not remove the site-size, bandwidth or deployment limits. GitHub's [Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) are hosting constraints; the permitted upload-artifact archive size is not a promise that a larger published site is supported. A catalogue within these limits needs no application server or paid database. It should still retain repository backups and periodic downloadable releases.

Official workflow references: [custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [checkout](https://github.com/actions/checkout), and [setup-node](https://github.com/actions/setup-node).
