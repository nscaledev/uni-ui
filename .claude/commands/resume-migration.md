# Resume: Design System Migration

You are resuming a design system migration on the `v1.16.x` branch of the Unikorn Cloud UI. The full plan is at `/home/simon/.claude/plans/3-when-you-mention-cheerful-wozniak.md`. Read it before doing anything.

## What this project is

SvelteKit + Svelte 5 app. We are migrating from Tailwind CSS v4 + Skeleton UI v3 to a custom design system (`src/styles/design.css`). The design reference is in `/tmp/unikorn_design/` (may need re-extracting from `~/Downloads/unikorn.zip` if lost).

## Migration strategy (critical)

`design.css` is imported **alongside** Tailwind — both active simultaneously. Pages are migrated one at a time. Tailwind and Skeleton packages are only removed in the final commit once everything is migrated. This is what keeps every intermediate commit buildable.

## Verification rule (non-negotiable)

Every commit must pass:
```
npm run check && npm run lint && npm run test:unit -- --run
```

## Completed commits (do not redo)

| # | Commit | SHA |
|---|--------|-----|
| 1 | Unit tests for utility modules | a4f37af |
| 2 | Delete dead routes and unused components | 11a87ef |
| 3 | Remove deprecated onkeypress handlers | ac06d98 |
| 4 | Fix $effect.pre misuse in SideBar | 7ede590 |
| 5 | Extract startAutoRefresh utility | b3f25b6 |
| 6 | Remove legacy regions section | 5a21d6e |
| 7 | Rename SelectNew → RichSelect | 9cf8bec |
| 8 | Add design CSS, fonts, bits-ui | 86a3af1 |

## Next commit to implement: Commit 8 — Theme store

**File to create**: `src/lib/stores/theme.ts`

```ts
// Three persisted stores, each synced to localStorage and applied to <html>
// appearance: 'light' | 'dim' | 'dark'   localStorage key: uk:appearance
// surface:    'solid' | 'glass'           localStorage key: uk:surface
// view:       'table' | 'cards' | 'grouped'  localStorage key: uk:view
//
// appearance and surface must call:
//   document.documentElement.setAttribute('data-appearance', value)
//   document.documentElement.setAttribute('data-surface', value)
// on change (use $effect, browser-guarded).
```

After that, the sequence continues through the plan: primitives (Icon, buttons, inputs, etc.), shell layout, page templates, then resource pages one by one.

## Key decisions already made

- **No stepper/wizard**: all create forms are single-page with FormSection cards + sticky summary panel
- **No virtual clusters**: deleted entirely
- **No compute clusters**: both legacy and clusters2 deleted
- **No identity view pages**: users/projects/serviceaccounts/sshcertificateauthorities view pages deleted
- **No K8s cluster view page**: deferred (no API for workload pool state yet)
- **Compute instances view page**: kept — shows instance + all dependency health
- **Regions section**: deleted entirely (superseded by V2 APIs)
- **Fonts**: self-hosted in `static/fonts/` (air-gapped deployment)
- **Icons**: Iconify to be removed; inline SVGs via `Icon.svelte` (Commit 9)
- **Scope picker**: org-level only initially (no project-level scope yet)
- **Select.svelte**: native `<select>` wrapper — keep as-is
- **RichSelect.svelte**: custom Popover-based dropdown for flavors/images (was SelectNew)

## Library decisions

- **bits-ui 2.18.0**: installed, use for Dialog, Accordion, Switch, Slider, Combobox, TagsInput
- **@floating-ui/dom**: already in deps, use for RichSelect popover and ScopePicker
- **Tailwind**: stays until final cleanup commit
- **Skeleton**: stays until final cleanup commit

## File structure so far

```
src/
  styles/design.css       ← verbatim design CSS + @font-face (do not Prettier-format)
  lib/
    loadutil.ts           ← startAutoRefresh() added
    loadutil.test.ts      ← tests added
    forms/
      RichSelect.svelte   ← was SelectNew.svelte
      [all others unchanged]
static/fonts/             ← 6 woff2 files (Inter Tight 300/400/500/600, JetBrains Mono 400/500)
```
