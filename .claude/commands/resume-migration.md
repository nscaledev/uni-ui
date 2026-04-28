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

## Completed commits

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
| 8b | Theme store (appearance/surface/view) | f861117 |
| 9 | Icon system (inline SVG, drop Iconify) | fb44b16 |
| 10 | Button primitives (.btn / .btn--ghost / .btn--icon) | deaf404 |
| 11 | FieldWrapper + TextInput + NumberInput | e108a5d |
| 12 | Switch (pure CSS toggle) | 72ce505 |
| 13 | RangeSlider (Bits UI Slider) | 591756a |
| 14 | MultiSelect (Bits UI Combobox) | f315e06 |
| 15 | InputChips (custom, no library) | 357731c |
| 16 | RichSelect (Floating UI) | c9ef03b |
| 17 | ModalIcon → Bits UI Dialog | e22aa8f |
| 18 | Toast system (custom, replaces Skeleton Toaster) | 6afcdcc |

## Next commit: Commit 19 — New primitives: Chip, StatusDot, Badge

**Files to create/update:**
- `src/lib/primitives/Chip.svelte` — NEW. Design's `.chip`, `.chip--ok`, `.chip--err`, `.chip--warn`, `.chip--muted` CSS classes.
- `src/lib/primitives/StatusDot.svelte` — NEW. A coloured dot for provisioning status.
- `src/lib/layouts/Badge.svelte` — RESKIN (already updated to use Icon; now apply design tokens).

**Chip usage in the codebase:** Not yet used — it's a new primitive that will replace ad-hoc badge-like elements when pages are migrated. The design's `.chip` class is already in `design.css`.

**StatusDot usage:** Will be used in list pages to show provisioning/health status. Should accept a `status` string and map to a colour.

After that:

## Commit 20 — Form layout primitives
- `FormSection.svelte` (was `ShellSection.svelte`) → design's `.form-section` card
- `FormRow.svelte` (NEW) → design's `.form-row` (`grid-template-columns: 220px 1fr`)
- `ResourceList.svelte` — reskin (keep API)
- `Placeholder.svelte` — reskin

## Commit 21 — Clipboard reskin
- `Clipboard.svelte` — reskin only, no API change

## Commits 22–25 — Shell (big visual change)
- 22: Brand, Sidebar, Header, Tweaks (`+layout.svelte` CSS grid)
- 23: ScopePicker
- 24: OmniSearch

## Commits 26–27 — Page templates
- 26: ListPage + stats utility
- 27: FormPage

## Commits 28–38 — Resource pages (one per resource)

---

## Key decisions (do not re-litigate)

- **No stepper/wizard**: all create forms are single-page (K8s clusters already converted)
- **No virtual clusters, no compute clusters, no legacy regions**: deleted
- **No identity view pages, no K8s cluster view page**: deleted
- **Compute instances view page**: kept — shows instance + all dependency health
- **Fonts**: self-hosted in `static/fonts/` (air-gapped deployment)
- **Icons**: inline SVGs via `Icon.svelte` in `src/lib/primitives/`
- **Switch**: pure CSS (no Bits UI needed)
- **InputChips**: pure Svelte (Bits UI v2 has no TagsInput)
- **RichSelect**: `@floating-ui/dom` with custom `sameWidth` middleware
- **Toast**: `toaster.svelte.ts` ($state store) + `Toast.svelte` renderer, no library
- **Toaster import**: `import { toaster } from '$lib/toaster.svelte'` (not `.ts`)
- **FieldWrapper**: base component for label/hint/validation — TextInput and NumberInput compose from it
- **Select.svelte**: native `<select>` wrapper — keep as-is (used for simple enums)
- **RichSelect.svelte**: custom Floating UI dropdown for rich-content options (flavors, images)

## Important file locations

```
src/
  styles/design.css           ← verbatim design CSS + @font-face (Prettier-ignored)
  lib/
    toaster.svelte.ts         ← $state toast store (.svelte.ts for runes)
    primitives/
      Icon.svelte             ← 45 inline SVGs, design names (plus, trash, edit…)
      Spinner.svelte          ← CSS @keyframes bars animation
      FieldWrapper.svelte     ← label/hint/validation wrapper for inputs
      Toast.svelte            ← renders toasts.list from toaster store
    forms/
      Button.svelte           ← .btn
      ButtonIcon.svelte       ← .btn.btn--icon
      SubtleButton.svelte     ← .btn.btn--ghost
      TextInput.svelte        ← composes FieldWrapper
      NumberInput.svelte      ← composes FieldWrapper
      Switch.svelte           ← pure CSS toggle, bind:checked + onCheckedChange legacy
      RangeSlider.svelte      ← Bits UI Slider, type="multiple"
      MultiSelect.svelte      ← Bits UI Combobox
      InputChips.svelte       ← custom tags input
      RichSelect.svelte       ← Floating UI custom dropdown
      Select.svelte           ← native <select> wrapper (unchanged)
    layouts/
      ModalIcon.svelte        ← Bits UI Dialog
      Badge.svelte            ← uses Icon.svelte, needs design token reskin
static/fonts/                 ← 6 woff2 files
```

## Remaining Skeleton usage (still active, to be removed in final commit)

Search: `grep -rn "skeletonlabs" src --include="*.svelte" --include="*.ts"`

Currently remaining in:
- `src/routes/(shell)/+layout.svelte` — AppBar, Avatar, Modal (hamburger drawer), Popover (user menu)
- `src/lib/shell/SideBar.svelte` — Navigation, Accordion (will be replaced in shell commit)
- `src/lib/forms/PopupButton.svelte` — Skeleton Popover (commit 21 area or shell commit)
