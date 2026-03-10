# Claude Code Guidelines

## Required Checks

All changes must pass the full lint target before being considered complete:

```
npm run lint
npm run check
helm lint --strict charts/ui
```

This mirrors the `make lint` target run in CI on every pull request.

## Language

Use US English for all end-user facing text (labels, hints, descriptions). This overrides any default language preference.

## Code Style

- Write readable TypeScript; prefer explicit types and clear variable names.
- Always populate optional structs (e.g. `features`, `autoUpgrade`) rather than leaving them undefined, so downstream code can read fields without defensive null-checks.
- Follow the existing Svelte 5 runes style (`$state`, `$derived`, `$effect.pre`) used throughout the codebase.
- Do not add comments unless the logic is non-obvious.
