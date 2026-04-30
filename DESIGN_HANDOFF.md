# Design Handoff — Unikorn Console

## Goal

This branch (`v1.16.x`) is converging the Svelte implementation with a signed-off
pixel-perfect design. The design has been approved; the implementation must match
it as closely as possible. Where the two diverge, this document explains why.

---

## Design artefacts

The canonical design is a React/HTML prototype delivered as a zip:

```
~/Downloads/unikorn.zip
```

Extract to inspect:

```sh
unzip ~/Downloads/unikorn.zip -d /tmp/unikorn-design
```

### Key files

| File                        | Purpose                                                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `design/styles.css`         | **The authoritative design token + component CSS file.** Use verbatim; it is framework-agnostic and already imported as `src/styles/design.css`. |
| `design/README.md`          | Design intent, layout spec, token values, interaction rules. Read first.                                                                         |
| `design/header.jsx`         | Reference for scope picker, OmniSearch, notifications, avatar layout.                                                                            |
| `design/sidebar.jsx`        | Reference for nav grouping, accordion behaviour, accent rail positions.                                                                          |
| `design/networks.jsx`       | **The canonical reference page.** Table/cards/grouped views, filter bar, bulk actions, pagination, status chips, sort headers.                   |
| `design/create-network.jsx` | Form page reference: sections, sticky summary aside, form-row grid, footer.                                                                      |
| `design/dashboard.jsx`      | Placeholder dashboard — not implemented.                                                                                                         |
| `design/data.js`            | Seed data, region-to-flag mapping, nav tree.                                                                                                     |
| `design/icons.jsx`          | SVG icon library. Ported to `src/lib/primitives/Icon.svelte`.                                                                                    |

---

## What has been implemented

- **Layout shell** — CSS grid `240px 1fr` / `52px 1fr`, grid areas brand/header/sidebar/main.
  No hairline dividers; chrome is one continuous plane in both solid and glass surface modes.
- **Two orthogonal theme axes** — `data-appearance` (light/dim/dark) and `data-surface`
  (solid/glass) on `<html>`, persisted to `localStorage` as `uk:appearance` / `uk:surface`.
- **Glass surface** — aurora gradient backdrop, `backdrop-filter` on shell chrome and cards.
- **Scope picker** — 680 px dual-column popover (orgs left, projects right), recents, search.
- **Tweaks panel** — bottom-right fixed panel exposing appearance + surface segmented controls.
- **Breadcrumb** — `Feature / Name` above every list page header.
- **Stat tiles** — 4-tile grid with coloured values (provisioned = accent, needs-attention =
  danger when > 0) and sub-labels.
- **OmniSearch** — typed filter chips (`status:`, `project:`, `region:`) in the header with
  ⌘K shortcut, focus-triggered suggestion panel, Backspace removes last chip.
- **Cards view** — `.rcard` grid (`repeat(auto-fill, minmax(340px, 1fr))`), badges-first
  layout (badges → name → id → key/value metadata). Project pip chip in badges row.
- **Unified status chip** — single chip per card driven by `resolveChip()` in
  `src/lib/layouts/effectiveStatus.ts`. Provisioning lifecycle wins until provisioned;
  then operational status (power state / health / account state) takes over.
- **⋯ overflow menu** — per-card action menu replaces the old button row. All destructive
  actions use `menu__item--danger`. `ModalIcon` supports `class` prop for menu rendering.
- **Table view (networks only)** — rich columns with status chip, project chip, region,
  prefix, owner, age. See table column rules below.
- **Bulk selection + BulkBar** — `ListPage` tracks `selectedIds` via Svelte context;
  `ShellListItem` shows checkbox when context present; `BulkBar` slides up with animation.
- **Client-side pagination** — 25 items/page default, 10/25/50/100 selector, page window.
- **View persistence** — `uk:view` in `localStorage` via the global `view` store.
- **Project filter chip** — suppressed when `projectOptions.length <= 1` (redundant when
  org has one project, or when already scoped to a project).
- **Metadata grid** — `<dl class="rcard__grid">` with `<dt>`/`<dd>` pairs for clean
  two-column key/value alignment across every card.

---

## Parts of the design explicitly **not** implemented

| Design element                            | Reason                                                                                                                                                                                                                                              |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Notifications button**                  | No notifications API exists yet. Will be added when the backend is ready.                                                                                                                                                                           |
| **Admin nav group**                       | Content of the admin section is undecided. Identity resources remain under Resources for now.                                                                                                                                                       |
| **Grouped / by-project view**             | No page currently provides a `groupKey` prop to `ListPage`. The view switcher button is hidden until at least one page implements it.                                                                                                               |
| **OmniSearch cross-resource suggestions** | The header has no access to resource data from other pages. The suggestion panel shows filter keys and status values only — no live resource results. The `type:` filter key was also dropped (overkill for current resource set).                  |
| **Sort headers in table**                 | The design has clickable sort headers (`.sortable`, `sortAsc`/`sortDesc` icons). Not implemented — all tables show data in API order. Add when needed.                                                                                              |
| **Dashboard**                             | Placeholder page only. The design's dashboard (donut charts, activity timeline, attention alerts) is not implemented.                                                                                                                               |
| **BulkBar checkbox in custom table rows** | `ListPage` injects a checkbox `<td>` in the generic fallback table. Pages with custom `tableRow` snippets currently render full `<tr>` elements and cannot receive the injected checkbox. This needs the `tableRow` contract to change (see below). |

---

## Known visual gaps (implemented but diverging from design)

None currently recorded.

---

## Table formatting rules

Only the **Networks** page (`src/routes/(shell)/network/networks/+page.svelte`) has a
rich `tableRow` snippet. All other pages fall back to the generic Name / Status / Age
columns.

### The guiding principle

> Choose columns by asking: _what does a professional operations engineer need to
> identify and assess this resource at a glance, without clicking in?_

Scan-level information belongs in the table. Detail-level information belongs on the
resource's detail/edit page.

### Networks table as the reference implementation

| Column  | Data                                     | Notes                                       |
| ------- | ---------------------------------------- | ------------------------------------------- |
| Name    | `metadata.name` + `metadata.id` sub-line | `.primary` class; ID in muted sub-line      |
| Status  | `.chip .chip--{kind}` with `.dot`        | `statusKind()` → ok/info/warn/err/muted     |
| Project | colour pip + project name                | From `data.projects` via `networkProject()` |
| Region  | flag emoji + region name                 | `.mono .region-cell`                        |
| Prefix  | `status.prefix`                          | `.mono`                                     |
| Owner   | `metadata.createdBy`                     | Strip `@domain.com` suffix for brevity      |
| Age     | `ageFormatter(metadata.creationTime)`    | `.mono`, muted colour                       |
| Actions | `row-action` button (trash)              | `opacity: 0`, revealed on row `:hover`      |

### Rules for adding table columns to other resource types

1. **Status chip always first data column** (after name). Use `.chip .chip--{kind}` with
   a `.dot` inside. Map provisioning status to chip kind: provisioned→ok, error→err,
   deprovisioning→warn, provisioning/pending→info, unknown→muted.

2. **Project column** — include when the resource is project-scoped and the table may show
   resources from multiple projects (i.e. when org-scoped). Omit when always
   scoped to a single project.

3. **Region column** — include when the resource has a region. Use `countryFlag()` +
   region name in `.mono .region-cell`.

4. **Resource-specific operational fields** — pick 1–3 fields that answer the most
   common operational question for that resource type. Examples:

   - Instances: primary IP address, power state
   - Clusters: node count, Kubernetes version
   - Security groups: associated network
   - Keep it short — the table should be scannable, not exhaustive.

5. **Owner + Age** — include on every table. Owner identifies who created it; age is
   a quick signal for "is this stale?".

6. **`tableRow` contract** — new pages should render `<td>` cells only (not `<tr>`).
   `ListPage` will own the `<tr>` and inject the checkbox `<td>` when a `bulkbar` prop
   is present. The networks page currently renders a full `<tr>` (pre-dates this
   contract) and will need updating when BulkBar is wired to the table view.

### Pages still needing rich table columns

- `compute/instances` — power state, primary IP, flavor/size
- `kubernetes/clusters` — node count, Kubernetes version, region
- `kubernetes/clustermanagers` — cluster count
- `network/securitygroups` — associated network, rule count
- `identity/users` — email/subject, last active, account state
- `identity/groups` — member count
- `identity/serviceaccounts` — expiry date
- All other identity and infrastructure pages as relevant

---

## Source of truth for CSS

`src/styles/design.css` is the single source of truth for all design tokens, component
classes, and surface variants. Do not add bespoke CSS to components when a `design.css`
class already covers the case. Key classes to know:

| Class(es)                                                                    | Used for                                      |
| ---------------------------------------------------------------------------- | --------------------------------------------- |
| `.rcard`, `.rcard__head`, `.rcard__name`, `.rcard__id`, `.rcard__grid`       | Card layout                                   |
| `.chip`, `.chip--ok/warn/err/info/muted`                                     | Status and context chips                      |
| `.menu`, `.menu__item`, `.menu__item--danger`, `.menu__sep`                  | Action menus                                  |
| `.bulkbar`, `.bulkbar__count`                                                | Bulk action bar (slide-up animation included) |
| `.stat`, `.stat__label`, `.stat__value`, `.stat__sub`, `.stat__sub.up/.down` | Stat tiles                                    |
| `.omni`, `.omni__token`, `.omni__panel`, `.omni__row`                        | OmniSearch bar                                |
| `.table`, `.table-wrap`, `.col-select`, `.row-action`, `.sortable`           | Table layout                                  |
| `.pagination`, `.page-btn`                                                   | Pagination bar                                |
| `.breadcrumb`, `.sep`                                                        | Page breadcrumb                               |
| `.page-head`, `.sub`, `.actions`                                             | Page header                                   |
| `.toolbar`, `.spacer`, `.seg`, `.filter-chip`                                | List page toolbar                             |
| `.form-section`, `.form-row`, `.form-side`, `.form-footer`                   | Create/edit forms                             |
