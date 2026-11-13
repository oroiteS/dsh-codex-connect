# Exact stock DSH 0.2.2-rc.3 compatibility candidate

Unreleased development evidence for the local Desktop DSH `0.2.2-rc.3` installation gate, prepared on 2026-11-14 from a working tree starting at main `c0d9e0d` (the rc.2 candidate). Published Alpha 13 and its sixteen exact Host pairings are unchanged: `verified-compatibility.json`, `INSTALL.md`, `update-highlights.json` and `package.json`'s version remain untouched, so public recommendations still point only at the published `0.2.0-alpha.13` pairings. The candidate adds only exact `0.2.2-rc.3` — not other 0.2.2 prereleases, stable releases, mixed Host packages or a wider pi-ai range. Submitted-head CI, the full Host matrix and release-time doc/catalog work remain required before any release; this record is not a release, publication or live-account acceptance.

## Observed local defect and root cause

On the updated Desktop app (CLI package `@deepseek-ai/dsh` `0.2.2-rc.3`, Cordis `4.1.0`), the plugin was absent from the running profile: `Config.listConfigs` returned 222 live entries with no `llm-openai-codex` row, `Tool.listTools` exposed no `codex*` tool, and the bundle's patch row never appeared.

The cause is the Host's bundle admission gate, not a plugin runtime error. `@deepseek-ai/dsh-app-boot` compares a bundle's declared DSH requirement with the single runtime version from `getDshRuntimeVersion()`; with no `engines.dsh`, every `@deepseek-ai/dsh` / `@deepseek-ai/dsh-*` `peerDependencies` range must match, prereleases participate in range matching, and an incompatible bundle is skipped before its module is imported and listed in `skippedBundles` (app-boot `README.md` §Profiles). All twenty declared peer ranges ended at `0.2.2-rc.2`, so `semver.satisfies('0.2.2-rc.3', range, { includePrerelease: true })` was false for 20/20 entries and the profile skipped the whole bundle layer.

## Official upgrade-guide audit (target `0.2.2-rc.3`, source range `v0.2.2-rc.2`)

The installed `@deepseek-ai/dsh` `0.2.2-rc.3` packaged `docs/upgrade-guide/` contains guide directories up to `v0.2.2-rc.1`; there is no `v0.2.2-rc.2` directory, so the packaged index documents no breaking change for the rc.2 → rc.3 step. No guide was therefore available to skip or apply; the rc.1 → rc.2 audit recorded in the previous candidate note still covers the newest packaged items.

Dependency-graph spot checks against the running Desktop runtime: `dsh-tools`, `dsh-llm`, `dsh-agent`, `dsh-session`, `dsh-web`, `dsh-attachment`, `dsh-compaction` and `dsh-llm-pi-ai` all report `0.2.2-rc.3`; Cordis stays `4.1.0` with Loader/Include `1.1.0` and Schemastery `3.19.0`, so the rc.1-era framework graph is unchanged. `Tools.prototype.presentAs` is still `undefined` in the rc.3 build, so the Task automation gate stays fail-closed for the same reason as rc.2.

## Change inventory

- `compatibility.json`: appends `"0.2.2-rc.3"` to `dshPluginApi.versions`; `"capabilities": { "taskAutomation": false }` is unchanged.
- `src/compatibility-policy.ts`: appends `'0.2.2-rc.3'` to `SUPPORTED_DSH_PLUGIN_API_VERSIONS`.
- `package.json`: appends `|| 0.2.2-rc.3` to all twenty `@deepseek-ai/dsh-*` peer ranges (including the optional `dsh-commands` peer).
- `scripts/check-compatibility.mjs`: appends to `REQUIRED_DSH_VERSIONS`.
- `scripts/check-dsh-next-contract.mjs`: appends to the fixture doctor's `supported` string.
- `tests/compatibility.spec.ts`: extends the exact-version `it.each` list; the coherent-isolation block now probes exact `0.2.2-rc.3` admission and uses `0.2.2-rc.4` as the out-of-range sample.
- `tests/install-version-guidance.spec.ts`: the declared list ends with `0.2.2-rc.3`; the Alpha 12 and Alpha 13 exact-record filters also exclude the new unreleased candidate.
- `tests/adaptive-task-host-policy.spec.ts`: the non-recovery assertion is now `it.each` over exact `0.2.2-rc.2` and `0.2.2-rc.3`.
- `tests/adaptive-task-recovery-contract.spec.ts`: adds exact `0.2.2-rc.3` to the versions outside the two verified recovery contracts.
- `README.md` / `docs/README.zh.md`: the bilingual unreleased-candidate note now covers exact rc.2 and rc.3 — session features work, Task delegation stays closed with `TASK_HOST_AUTOMATION_UNVERIFIED`, no recovery exits; `README.i18n.yaml` blob hashes re-recorded.
- Regenerated `lib/` output embeds the extended range.

## Executed evidence

- Root cause reproduction: `semver.satisfies` over the plugin's twenty DSH peer ranges reports 20/20 unmet at `0.2.2-rc.3`; after the change the same evaluation reports 0 unmet.
- `scripts/check-installed-runtime.mjs` run against the real Desktop profile package (`~/.dsh/profiles/desktop/package.json`) and the installed host (`$DSH_INSTALL_DIR/package.json`) passed on rc.3 with the pre-change `lib/`: 12 Codex models registered and prepared, disposal verified, reserve retirement, native compaction (10 fresh processes, none/zstd), images, request metrics, search route, preflight, retry policy and Task HTTP lifecycle all green. The rc.3 break was admission-only; the imported surface needed no code change.
- `check:compatibility`, `lint:metadata` (44 regression cases), `typecheck`, `build` (five files), and the four affected spec files (131 tests) passed.
- Node v26.13.1 for the repository checks; the installed-runtime check ran through the app's Electron-as-Node runtime v24.21.0, macOS arm64.

## Remaining limitations

No packed/installed exact-`0.2.2-rc.3` temp-fixture run of `scripts/check-dsh-install.mjs`, no full Host matrix, no Node 22/24 CI, no real-account, native-GUI or Windows Desktop acceptance. The bundled `docs` candidate note states the rc.3 declaration, but `verified-compatibility.json`, `INSTALL.md`, `update-highlights.json` and the package version remain release-time work not performed here. The plugin also depends on the Desktop app's own profile recomposition (or a restart) before the previously skipped bundle is admitted again.
