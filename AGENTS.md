# Development Workflow

- **Naming:** Use a few descriptive words about the feature, fix, or bug for
  branch names and PR titles; never include Codex, Claude, or other AI agent
  names. Work on a feature branch and reuse the task's existing branch when available.
- **Attribution:** Never credit AI agents as authors or co-authors in commits or
  PRs, including `Co-authored-by` trailers.
- **Simplicity:** Prefer the existing tools and their defaults. Add dependencies,
  configuration, or scripts only when the requested work needs them.

## Phase 1: Exploration

- Read `package.json` for the current Node requirement, scripts, dependencies,
  and package exports. Install locked dependencies with `npm ci`.
- This library provides financial functions. Compare related implementations
  and tests before changing public behavior, naming, or numerical algorithms.
- Public functions live in `src/finance/` and are exported through `src/index.ts`
  and, when browser-safe, `src/web.ts`.
  Put new shared helper functions in `src/finance/helpers/`, creating the
  directory when needed. Keep helpers out of the public entry points.

## Phase 2: Implementation

- **Public API Organization:** Give each new public function a matching
  `src/finance/<functionName>.ts` implementation and
  `test/finance/<functionName>.test.ts` test. Export it through `src/index.ts`.
  Match the surrounding import and export conventions.
- **Public Parameters:** For new public functions, place required inputs first
  as positional parameters, followed by a single optional `options` object
  defaulting to `{}` when configuration is needed. Match the argument order of
  comparable functions. Preserve existing signatures unless the task changes them.
- **Inline Public Types:** Define object-shaped public parameter types inline,
  including nested objects within options. Built-in types such as `Promise`,
  `Date`, and `URL` may remain named. Reusable implementation-only types stay
  with their implementation and are not re-exported from `src/index.ts`.
- **Typing:** Use concrete types for known values and `unknown` with validation
  for untrusted values. Type assertions and lint suppressions are prohibited;
  resolve issues through accurate types, narrowing, or runtime validation.
- **Documentation:** Write JSDoc for public functions, classes, methods, and
  accessors. For new or modified blocks, order content as: description and
  explanatory prose; all `@example` blocks; all `@param` tags; then `@returns`,
  `@category`, and other reference metadata. Include at least one runnable usage
  example and use `@category Finance` for financial functions.

## Phase 3: Validation

- Skip live-network tests when `CI=true` using
  `test.skipIf(process.env.CI === "true")`. Run them locally by default, and keep
  offline and mocked tests enabled everywhere.

- Run the relevant tests while developing. Use `npm run fix` to fix formatting
  and automatically fixable lint issues, then resolve remaining errors before
  running `npm run all-tests`. Run all checks before handing off changes and
  report any check that could not run.
- Update documentation through source JSDoc, `README.md`, or the documentation
  configuration and generator, then run `npm run docs`. Do not edit generated
  `docs/`, `site/`, `llm.md`, or `llms.txt` by hand. Commit regenerated `docs/`,
  `llm.md`, and `llms.txt` with the change; keep `site/` ignored.

## Releases

Keep the package version unchanged during ordinary development. Use
`npm run patch`, `npm run minor`, or `npm run major` only for a requested release:
these commands validate, bump the version, regenerate documentation, commit,
create a tag, and push. The tag triggers npm publication and documentation
deployment. Documentation versions and release links come from `package.json`;
keep their generation automatic.
