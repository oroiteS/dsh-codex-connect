# Exact stock DSH 0.2.2-rc.4 / 0.2.2-rc.5 compatibility candidate

Unreleased development evidence for the local Desktop DSH `0.2.2-rc.5` installation gate, prepared on 2026-11-19 from a working tree starting at main `84214bc` (published Alpha 15). Published Alpha 15, its eighteen exact Host pairings and `verified-compatibility.json` are unchanged: the version remains the local `0.2.0-alpha.16` source candidate, and public recommendations still point only at published `0.2.0-alpha.15`. The candidate adds only exact `0.2.2-rc.4` and `0.2.2-rc.5` — not other 0.2.2 prereleases, stable releases, mixed Host packages or a wider pi-ai range. This record is not a release, publication or live-account acceptance.

## Observed local defect and root cause

On the updated Desktop app (CLI package `@deepseek-ai/dsh` `0.2.2-rc.5`, Cordis `4.1.0`, Electron Node `24.21.0`), the plugin was absent from the running profile: `Config.listConfigs` returned 208 live entries with no `llm-openai-codex` row, although `~/.dsh/profiles/desktop/cordis.patch.yml` still configured the entry. The Desktop host log recorded the exact reason:

```text
dsh: skipping profile bundle "dsh-codex-connect": Error: Plugin dsh-codex-connect@0.2.0-alpha.15 is incompatible with dsh 0.2.2-rc.5:
requirements {"@deepseek-ai/dsh-agent":"… || 0.2.2-rc.3", …}
```

The cause is the Host's bundle admission gate, not a plugin runtime error. The Host compares every declared `@deepseek-ai/dsh*` peer range with the single runtime version; all twenty ranges ended at `0.2.2-rc.3`, so the whole bundle layer was skipped before its module was imported. Cordis `4.1.0` is already admitted by the existing `^4.0.2 || 4.0.6-alpha.2` peer range, so no framework peer change was required.

## Official upgrade-guide audit (source range `v0.2.2-rc.3`, target `0.2.2-rc.5`)

The installed `@deepseek-ai/dsh` `0.2.2-rc.5` packaged `docs/upgrade-guide/` documents two steps:

- `v0.2.2-rc.3/deepseek-refusal-code` — the DeepSeek streamed content-refusal code changes from `MALFORMED_RESPONSE` to `CONTENT_REFUSED`. The plugin's own `OPENAI_CODEX_MALFORMED_RESPONSE` image-transport code is unrelated and was left unchanged.
- `v0.2.2-rc.4/web-search-deepseek-model-default` — the shipped composition no longer pins `web.searchProvider`. The plugin registers its own search provider through `@deepseek-ai/dsh-web` without any changed interface, so no migration applies.

No other breaking surface was listed, and no imported surface needed a code change for the Host upgrade itself.

## Change inventory

- `compatibility.json`: appends `"0.2.2-rc.4"` and `"0.2.2-rc.5"` to `dshPluginApi.versions`; `capabilities.taskAutomation` stays `false`.
- `src/compatibility-policy.ts`: appends both Hosts to `SUPPORTED_DSH_PLUGIN_API_VERSIONS` and records that rc.3/rc.4/rc.5 stay outside the recovery contract.
- `package.json`: appends `|| 0.2.2-rc.4 || 0.2.2-rc.5` to all twenty `@deepseek-ai/dsh-*` peer ranges (including the optional `dsh-commands` peer); version becomes the unreleased `0.2.0-alpha.16`.
- `scripts/check-compatibility.mjs`: appends both Hosts to `REQUIRED_DSH_VERSIONS`.
- `scripts/check-dsh-next-contract.mjs`: appends both Hosts to the fixture doctor's `supported` string.
- `src/model-catalog.ts` / `src/model-contract.ts`: port upstream Alpha 16's `gpt-6.2-sol` and `gpt-6.2-astra` catalog fallbacks, their own context provenance source and the 872,000 local override ceiling; Ultrafast eligibility is unchanged.
- `scripts/check-installed-runtime.mjs`: asserts the two new models survive preparation on a real Host.
- `tests/compatibility.spec.ts`: the exact-version `it.each` list ends at `0.2.2-rc.5`; the coherent-isolation block now probes rc.3/rc.4/rc.5 admission and uses `0.2.2-rc.6` as the out-of-range sample.
- `tests/install-version-guidance.spec.ts`: the declared list ends at `0.2.2-rc.5` (20 entries); published pairings and the Alpha 13/Alpha 14/Alpha 15 filters exclude the three unreleased candidates.
- `tests/adaptive-task-host-policy.spec.ts`, `tests/adaptive-task-recovery-contract.spec.ts`: rc.4/rc.5 join rc.3 outside the recovery contract; Task automation stays closed and fails with `TASK_HOST_AUTOMATION_UNVERIFIED`.
- `tests/gpt62-models.spec.ts` and the focused model suites: ported from upstream Alpha 16.
- `README.md` / `docs/README.zh.md`: a bilingual unreleased-candidate note; `README.i18n.yaml` blob hashes re-recorded.
- `docs/agent-notes/gpt62-models-support.md`: upstream's model evidence plus a local port note.
- Regenerated `lib/` output embeds the extended ranges and the new catalog.

## Executed evidence

- Root cause reproduction: the Desktop host log names all twenty unmet peer ranges at `0.2.2-rc.5`; after the change `semver.satisfies('0.2.2-rc.5', '<SUPPORTED_DSH_PLUGIN_API_RANGE>', { includePrerelease: true })` is true for 20/20 and `pnpm run check:compatibility` reports `status: compatible`.
- Host admission gate, using the running Host's own `evaluatePluginCompatibility` from `@deepseek-ai/dsh-app-boot` at runtime `0.2.2-rc.5`: the pre-change `0.2.0-alpha.15` manifest is `REJECTED` with 20 unmet requirements; the candidate `0.2.0-alpha.16` manifest is `ADMITTED` with no requirement left. This is the exact predicate that skipped the bundle, evaluated outside the running process.
- `scripts/check-installed-runtime.mjs` against the real Desktop profile (`~/.dsh/profiles/desktop/package.json`, whose `dsh-codex-connect` link resolves to this checkout) and the real installed `0.2.2-rc.5` host (`$DSH_INSTALL_DIR/package.json`) passed: 14 Codex models registered and prepared (including `gpt-6.2-sol` and `gpt-6.2-astra`), provider disposal verified, reserve retirement, native compaction (10 fresh processes, none/zstd), images, request metrics, search route, preflight, retry policy and Task HTTP lifecycle all green. All responses were synthetic; no real credential was read and no live model was called.
- Focused suites `compatibility`, `install-version-guidance`, `adaptive-task-host-policy`, `adaptive-task-recovery-contract`, `gpt62-models`, `model-contract`, `adapter` and `speed-mode-contract`: 8 files / 214 tests passed.
- `pnpm run check` passed `check:release-workflow`, `check:canary-workflow`, `lint`, `typecheck`, `build`, `check:env-proxy-import`, `check:isolated-import`, `check:capability-cli`, `check:request-metrics` and `check:compatibility`. The full Vitest run reported 174 passed files / 2 failed files, and both failures (`native-compaction-probes.spec.ts`, `native-compaction-controlled-cases.spec.ts`, 25 tests) reproduce identically on the clean pre-change main checkout, so they are pre-existing local-environment failures rather than regressions. `pack:check` stops in npm with `~/.npm` cache-ownership errors and fails the same way on the clean checkout.
- Node `v26.13.1` and pnpm `12.21.0` for the repository checks; the installed-runtime check ran through the app's Electron-as-Node runtime `v24.21.0`, macOS arm64.

## Remaining limitations

The candidate is not packed, published or installed from the registry; there is no exact-`0.2.2-rc.5` temp-fixture run of `scripts/check-dsh-install.mjs`, no full Host matrix, no Node 22/24 CI run and no real-account, native-GUI or Windows Desktop acceptance. `verified-compatibility.json`, `INSTALL.md`, `update-highlights.json` and the published recommendation remain release-time work. The Desktop app must recompose the profile (restart) before the previously skipped bundle is admitted again; a reload alone does not re-run bundle admission.
