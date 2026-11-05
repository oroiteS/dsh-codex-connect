# Exact stock DSH 0.2.2-rc.1 compatibility candidate

This is unreleased development evidence for the local DSH 0.2.2-rc.1 installation gate, prepared on a working tree starting from main `674af2699af2755619e130081e26dd8b3d37f371` (tree `9fa8e18f506c51eed0001105106fa31131606d8f` plus the eleven changed files listed below). Published Alpha 12 and its fifteen exact Host pairings are unchanged: `verified-compatibility.json`, `INSTALL.md`, both READMEs, `update-highlights.json` and `package.json`'s version remain untouched, so public recommendations still point only at the published `0.2.0-alpha.12` pairings. The candidate adds only exact `0.2.2-rc.1` — not other 0.2.2 prereleases, stable releases, mixed Host packages or a wider pi-ai range. Submitted-head CI, the full sixteen-Host matrix, the browser suite and independent review remain required before any release; this record is not a release, publication or live-account acceptance.

## Change inventory

- `compatibility.json`: appends `"0.2.2-rc.1"` to `dshPluginApi.versions`.
- `package.json`: appends `|| 0.2.2-rc.1` to all twenty `@deepseek-ai/dsh-*` peer ranges (including the optional `dsh-commands` peer).
- `src/compatibility-policy.ts`: appends `'0.2.2-rc.1'` to `SUPPORTED_DSH_PLUGIN_API_VERSIONS`; `SUPPORTED_DSH_PLUGIN_API_RANGE` is derived.
- `scripts/check-compatibility.mjs`: appends to `REQUIRED_DSH_VERSIONS`.
- `scripts/check-dsh-next-contract.mjs`: appends to the fixture doctor's `supported` string.
- `tests/compatibility.spec.ts`: extends the exact-version `it.each` list and adds an "admits only exact coherent 0.2.2-rc.1" isolation block probing `0.2.2-alpha.2`, `0.2.2-rc.2` and `0.2.2`.
- `tests/install-version-guidance.spec.ts`: candidate-era assertions — the declared list ends with `0.2.2-rc.1` while Alpha 12's catalog entry and every other entry still exclude it.
- Regenerated `lib/` output (four files) embeds the extended range.

The alpha.3-only Task recovery binding (`src/adaptive-task-host-policy.ts`, `RECOVERY_HOST = '0.2.2-alpha.3'`) is deliberately unchanged: recovery-only Task handling stays exclusive to that exact Host, and `0.2.2-rc.1` behaves like the prior fourteen ordinary Hosts.

## Executed evidence

- Changed-area unit tests: `compatibility.spec.ts`, `install-version-guidance.spec.ts`, `update-compatibility.spec.ts`, `capability-cli.spec.ts` — 99 passed. Full `vitest run` on the tree: 2,432 passed, 27 failed in three files; a clean-HEAD stash run reproduces the same 25 `native-compaction-probes`/`native-compaction-controlled-cases` failures, so they are pre-existing local environment failures unrelated to this change (the two `compatibility.spec.ts` failures were an initial probe bug in this candidate, fixed by probing only out-of-range versions).
- `lint`, `typecheck`, `check:release-workflow`, `check:canary-workflow` (including the updated contract fixture), `build`, `check:env-proxy-import`, `check:isolated-import`, `check:capability-cli`, `check:request-metrics`, `check:compatibility` (status `compatible` across the extended range) and `pack:check` (73 packed files validated) all passed on Node v26.13.0.
- An actual packed/installed exact `0.2.2-rc.1` run of the unmodified `scripts/check-dsh-install.mjs` passed the full build→pack→official exact dependency install→stock profile boot→doctor→installed-runtime sequence: macOS arm64, Node v26.13.0, DSH `0.2.2-rc.1` from the public registry, plugin artifact `dsh-codex-connect-0.2.0-alpha.12.tgz` SHA-256 `506bb2e4f7c26a04de26847bc80f1400cee308127c9b5b3d3fc54ee8d40e967c`. Doctor reported `compatible` against the extended range; the runtime contract verified 12 models with reasoning parity and preparation, disposal, reserve retirement (legacy model blocked, return file preserved, zero real provider requests), ten fresh-process native-compaction phases across none/zstd, synthetic images/preflight/retry/search-route/task-HTTP lifecycles, unchanged defaults and all optional capabilities false.

The verification used a private npm cache override (`npm_config_cache`) because `~/.npm` contains root-owned files that make stock npm fail with `EPERM`; this is a local machine issue, not a plugin or Host issue, and was not "fixed" by permission changes.

- The live Desktop profile (`~/.dsh/profiles/desktop`, Electron-managed, Host packages `0.2.2-rc.1`) had the plugin re-linked through the profile plugin manager: `remove_bundle` then `install_bundle` of this directory both returned `application: "applied"` with `bundle: dsh-codex-connect`, `version: 0.2.0-alpha.12`, `enabled: true` and no compatibility warning. The previous gate rejection quoted the old fifteen-version peer ranges; the reinstall read the extended ranges and passed, so the running Host's exact-version requirement is satisfied by this tree. Whether the already-running Electron process exposes the reactivated provider to sessions opened before the change was not verified from inside the pre-existing session; a full app restart is the conservative way to reload it.

## Remaining limitations

The sixteen-Host same-artifact matrix, Node 22/24 CI, browser regression, bilingual doc/catalog updates and the Alpha 13 version bump are release-time work that has not been performed. No Desktop activation, real-account, GUI or live Auto-review acceptance was exercised beyond the stock profile boot and doctor inside the isolated check. No credentials, daily profiles, services, system permissions or publication tags were changed.
