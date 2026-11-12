# Exact stock DSH 0.2.2-rc.2 compatibility candidate

Unreleased development evidence for the local Desktop DSH `0.2.2-rc.2` installation gate, prepared on a working tree starting from main `4738487a3ffd15245d6feaacc5362a3c84a0c9f0`. Published Alpha 13 and its sixteen exact Host pairings are unchanged: `verified-compatibility.json`, `INSTALL.md`, both READMEs, `update-highlights.json` and `package.json`'s version remain untouched, so public recommendations still point only at the published `0.2.0-alpha.13` pairings. The candidate adds only exact `0.2.2-rc.2` — not other 0.2.2 prereleases, stable releases, mixed Host packages or a wider pi-ai range. Submitted-head CI, the full Host matrix and release-time doc/catalog work remain required before any release; this record is not a release, publication or live-account acceptance.

## Official upgrade-guide audit (target `0.2.2-rc.2`, source range `v0.2.2-rc.1`)

The installed `@deepseek-ai/dsh` `0.2.2-rc.1` packaged index lists nineteen guides for the rc.1 → rc.2 step. None reaches the plugin's imported surface:

- Skipped as unrelated surfaces (no import or patch reference in `src/`): account-notification-fields, account-remote-provider, archive-worktrees, cua-ax-read-limits, cua-hover-ax-only, cua-native-platform, dsh-doc-skill, forge-change-request-overview, forge-pinned-diff, forge-review-reads, plugin-update-method (no `BundleInfo.updatable`/`ManagementError` use), runtime-context-reminders, subagent-interrupt-default, terminal-backend-cleanup-error, terminal-bundle-sidebar-backend, window-drag-regions.
- Inspected as touching nearby seams, no code change required: attachment-error-codes (the plugin never imports `AttachmentError` and keeps no `UNKNOWN`-fallback or HarnessError-before-AttachmentError ordering), session-append-overloads (the plugin never wraps `Session.append`; the single `append: () => undefined` duck-type test double in `tests/view-image.spec.ts` accepts both overloads behind an `as never` boundary), web-search-billing (the plugin uses only the `@deepseek-ai/dsh-web` public seam types — `WebError`, `WebSearchProvider` — and never constructs the renamed `dsh-web-deepseek-api` providers).

Dependency-graph spot checks against the running Desktop runtime: all spot-checked Host packages (`dsh-tools`, `dsh-agent`, `dsh-agent-loop`, `dsh-llm`, `dsh-llm-pi-ai`, `dsh-compaction`, `dsh-session`, `dsh-web`, `dsh-attachment`) report `0.2.2-rc.2`; Cordis stays `4.1.0`, so the rc.1-era framework graph (Cordis `~4.1.0`, Loader/Include `~1.1.0`, Schemastery `~3.19.0`) is unchanged. `presentAs` is absent from the rc.2 `dsh-tools` build, and the registry tarball for `@deepseek-ai/dsh-tools@0.2.2-rc.1` is equally absent of it — no rc.1 → rc.2 regression.

## Change inventory

- `compatibility.json`: appends `"0.2.2-rc.2"` to `dshPluginApi.versions` and adds `"capabilities": { "taskAutomation": false }`.
- `src/compatibility-policy.ts`: appends `'0.2.2-rc.2'` to `SUPPORTED_DSH_PLUGIN_API_VERSIONS`; adds the mirrored `HOST_CAPABILITIES = { taskAutomation: false }` to `COMPATIBILITY_CONTRACT` — delegated Task automation is declared closed on every listed version, so declared support never implies full Task support.
- `package.json`: appends `|| 0.2.2-rc.2` to all twenty `@deepseek-ai/dsh-*` peer ranges (including the optional `dsh-commands` peer).
- `scripts/check-compatibility.mjs`: appends to `REQUIRED_DSH_VERSIONS`.
- `scripts/check-dsh-next-contract.mjs`: appends to the fixture doctor's `supported` string.
- `tests/compatibility.spec.ts`: extends the exact-version `it.each` list; adds the taskAutomation-closed declaration lock; the coherent-isolation block now probes exact `0.2.2-rc.2` admission and uses `0.2.2-rc.3` as the out-of-range sample.
- `tests/install-version-guidance.spec.ts`: candidate-era assertions — the declared list ends with `0.2.2-rc.2` while the Alpha 12 catalog filter and the Alpha 13 exact-record assertion both exclude the unreleased candidate.
- `tests/adaptive-task-host-policy.spec.ts`: adds an explicit assertion that exact `0.2.2-rc.2` stays outside the recovery contract (`taskHostRecoveryOnly()` is false).
- `README.md` / `docs/README.zh.md`: add the bilingual unreleased-candidate note for exact rc.2 — session features work, Task delegation stays closed with `TASK_HOST_AUTOMATION_UNVERIFIED`, no recovery exits; `README.i18n.yaml` blob hashes re-recorded.
- Regenerated `lib/` output (four files) embeds the extended range and the capability declaration.

Separately, this working tree carries a reviewed fix for the rc.2 Host API surface (`src/agent-tree-compat.ts` with `tests/agent-tree-compat.spec.ts`, wired into the delegation files): the removed `agents.roots()`/`isOwnedBy()` calls no longer crash every turn on rc.2. The remaining known rc.2 gaps are recorded, not fixed: `agents.create({ parentAgent })` is silently ignored so delegated children would not join the run tree (a future `ctx.subagents.startActivation` migration), and the `presentAs` executor-only signal no longer exists anywhere in rc.2, keeping the Task automation gate fail-closed by design.

The Task recovery binding (`src/adaptive-task-host-policy.ts`, `scripts/adaptive-task-recovery-contract.mjs`) is deliberately unchanged, following the rc.1 candidate precedent: recovery-only Task handling stays exclusive to the exact `0.2.2-alpha.3`/`0.2.2-rc.1` Hosts whose recovery contracts were exercised. On exact `0.2.2-rc.2`, `assertTaskHostAutomation()` keeps failing closed — the runtime cannot pass the `Tools.prototype.presentAs` executor-only check there, so Task attempts surface `TASK_HOST_AUTOMATION_UNVERIFIED` rather than any recovery authority. The unit-suite assertion covers only the metadata layer (`taskHostRecoveryOnly()` is false); the `presentAs` branch depends on the real installed tool runtime and is not unit-simulated.

## Executed evidence

- Node v26.13.0, macOS arm64, devDependencies pinned to `0.1.7-rc.1` as shipped.
- `typecheck`, `lint` (44 metadata regression cases), `build` (five files; `lib/` embeds the extended range), `check:release-workflow` (39/39), `check:canary-workflow` including the updated `check-dsh-next-contract` (76/76), `check:env-proxy-import`, `check:isolated-import`, `check:capability-cli`, `check:request-metrics`, `check:compatibility` (`compatible` across the extended range) and `pack:check` (74 packed files, with a private `npm_config_cache` because stock `~/.npm` is not writable in this session's sandbox) all passed.
- `vitest run`: 2,451 passed, 2 skipped, 25 failed — every failure is in `tests/native-compaction-probes.spec.ts` / `tests/native-compaction-controlled-cases.spec.ts` with child-process exit 9. A clean-HEAD stash run reproduces the identical failures; the root cause is Node 26 removing the `--experimental-transform-types` flag those probes pass to `node` (type stripping is default there). These are pre-existing local-environment failures unrelated to this change and remain separately actionable.
- `test:browser` (Playwright chromium-headless-shell v1248, downloaded on request via the local proxy): 15 files, 101 tests passed.

## Remaining limitations

No packed/installed exact-`0.2.2-rc.2` run of `scripts/check-dsh-install.mjs`, no full Host matrix, no Node 22/24 CI, no real-account, native-GUI or Windows Desktop acceptance. `verified-compatibility.json`, INSTALL.md, README, `update-highlights.json` and the package version are release-time work not performed here.
