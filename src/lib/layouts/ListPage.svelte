<script
	lang="ts"
	generics="T extends { metadata: { id: string; provisioningStatus: string; creationTime: Date; name: string; deletionTime?: Date } }"
>
	import type { Snippet } from 'svelte';
	import { setContext } from 'svelte';
	import { computeStats } from '$lib/layouts/stats';
	import { ageFormatter } from '$lib/formatters';
	import type { ShellPageSettings } from '$lib/layouts/types';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import BulkBar from '$lib/layouts/BulkBar.svelte';
	import FilterChip from '$lib/forms/FilterChip.svelte';
	import Icon from '$lib/primitives/Icon.svelte';
	import * as Identity from '$lib/openapi/identity';
	import { countryFlag } from '$lib/regionutil';
	import { view } from '$lib/stores/theme';
	import { omniQuery, omniFilters } from '$lib/stores/search';

	interface NamedItem {
		metadata: { id: string; name: string };
	}

	interface SelectContext {
		isSelected: (id: string) => boolean;
		toggle: (id: string) => void;
	}

	interface Props {
		settings: ShellPageSettings;
		resources: Array<T>;
		filterFn?: (r: T, query: string) => boolean;
		tools?: Snippet;
		list: Snippet<[Array<T>]>;
		tableRow?: Snippet<[T]>;
		tableHeaders?: Array<string>;
		groupKey?: (r: T) => string;
		groupLabel?: (key: string) => string;
		projects?: Array<NamedItem>;
		regions?: Array<NamedItem>;
		empty?: Snippet;
		bulkbar?: Snippet<[{ ids: Set<string>; clear: () => void }]>;
	}

	let {
		settings,
		resources,
		filterFn,
		tools,
		list,
		tableRow,
		tableHeaders,
		groupKey,
		groupLabel,
		projects,
		regions,
		empty,
		bulkbar
	}: Props = $props();

	// ── local filter state ────────────────────────────────────────
	let query = $state('');
	let selectedStatuses = $state(new Set<string>());
	let selectedProjectIds = $state(new Set<string>());
	let selectedRegionIds = $state(new Set<string>());

	const anyFilterActive = $derived(
		!!query.trim() ||
			selectedStatuses.size > 0 ||
			selectedProjectIds.size > 0 ||
			selectedRegionIds.size > 0
	);

	function clearAll() {
		query = '';
		selectedStatuses = new Set();
		selectedProjectIds = new Set();
		selectedRegionIds = new Set();
	}

	// ── selection state ───────────────────────────────────────────
	let selectedIds = $state(new Set<string>());

	function toggleId(id: string) {
		const s = new Set(selectedIds);
		s.has(id) ? s.delete(id) : s.add(id);
		selectedIds = s;
	}

	function clearSelection() {
		selectedIds = new Set();
	}

	// Expose selection state to descendant components (e.g. ShellListItem).
	if (bulkbar) {
		setContext<SelectContext>('bulkSelect', {
			isSelected: (id) => selectedIds.has(id),
			toggle: toggleId
		});
	}

	// ── filter options ────────────────────────────────────────────
	const STATUS_DISPLAY: Array<{ v: Identity.ResourceProvisioningStatus; color: string }> = [
		{ v: Identity.ResourceProvisioningStatus.Provisioned, color: 'var(--accent)' },
		{ v: Identity.ResourceProvisioningStatus.Provisioning, color: 'oklch(0.6 0.15 200)' },
		{ v: Identity.ResourceProvisioningStatus.Pending, color: 'oklch(0.75 0.15 60)' },
		{ v: Identity.ResourceProvisioningStatus.Deprovisioning, color: 'oklch(0.7 0.12 30)' },
		{ v: Identity.ResourceProvisioningStatus.Error, color: 'var(--danger)' },
		{ v: Identity.ResourceProvisioningStatus.Unknown, color: 'var(--text-4)' }
	];
	const statusOptions = STATUS_DISPLAY.map(({ v, color }) => ({
		id: v,
		label: v.charAt(0).toUpperCase() + v.slice(1),
		color
	}));

	const PROJECT_PALETTE = [
		'oklch(0.65 0.18 220)',
		'oklch(0.65 0.18 290)',
		'oklch(0.68 0.16 30)',
		'oklch(0.65 0.18 340)',
		'oklch(0.65 0.16 170)',
		'oklch(0.68 0.16 80)'
	];

	const projectOptions = $derived(
		(projects ?? []).map((p, i) => ({
			id: p.metadata.id,
			label: p.metadata.name,
			color: PROJECT_PALETTE[i % PROJECT_PALETTE.length]
		}))
	);

	const regionOptions = $derived(
		(regions ?? []).map((r) => ({
			id: r.metadata.id,
			label: r.metadata.name,
			prefix: countryFlag(r.metadata.name.split('-')[0])
		}))
	);

	$effect(() => {
		if ($view === 'grouped' && !groupKey) $view = 'cards';
	});

	// ── filtered list ─────────────────────────────────────────────
	const filtered = $derived.by(() => {
		let r = resources;

		if (selectedStatuses.size > 0)
			r = r.filter((x) => selectedStatuses.has(x.metadata.provisioningStatus));

		if (selectedProjectIds.size > 0)
			r = r.filter((x) => {
				const pid = (x as unknown as { metadata: { projectId?: string } }).metadata.projectId;
				return pid ? selectedProjectIds.has(pid) : false;
			});

		if (selectedRegionIds.size > 0)
			r = r.filter((x) => {
				const a = x as unknown as { status?: { regionId?: string }; spec?: { regionId?: string } };
				const rid = a.status?.regionId ?? a.spec?.regionId;
				return rid ? selectedRegionIds.has(rid) : false;
			});

		if (query.trim()) {
			const q = query.toLowerCase();
			const fn = filterFn ?? ((x: T) => x.metadata.name.toLowerCase().includes(q));
			r = r.filter((x) => fn(x, q));
		}

		// Apply global omni-search on top of local filters.
		if ($omniQuery.trim()) {
			const q = $omniQuery.toLowerCase();
			const fn = filterFn ?? ((x: T) => x.metadata.name.toLowerCase().includes(q));
			r = r.filter((x) => fn(x, q));
		}
		for (const { key, value } of $omniFilters) {
			if (key === 'status') r = r.filter((x) => x.metadata.provisioningStatus === value);
			if (key === 'project')
				r = r.filter(
					(x) => (x as unknown as { metadata: { projectId?: string } }).metadata.projectId === value
				);
			if (key === 'region')
				r = r.filter((x) => {
					const a = x as unknown as {
						status?: { regionId?: string };
						spec?: { regionId?: string };
					};
					return (a.status?.regionId ?? a.spec?.regionId) === value;
				});
		}

		return r;
	});

	const groups = $derived.by(() => {
		if ($view !== 'grouped' || !groupKey) return null;
		const map = new Map<string, Array<T>>();
		for (const r of filtered) {
			const k = groupKey(r);
			if (!map.has(k)) map.set(k, []);
			map.get(k)!.push(r);
		}
		return Array.from(map.entries()).map(([key, items]) => ({
			key,
			label: groupLabel ? groupLabel(key) : key,
			items
		}));
	});

	// ── pagination ────────────────────────────────────────────────
	let currentPage = $state(1);
	let perPage = $state(25);

	// Trim selection to IDs still present after a data refresh or filter change.
	// Preserves stable selections across auto-refreshes; removes items that
	// no longer exist or no longer match the current filters.
	$effect(() => {
		const valid = new Set(filtered.map((r) => r.metadata.id));
		const trimmed = new Set([...selectedIds].filter((id) => valid.has(id)));
		if (trimmed.size !== selectedIds.size) selectedIds = trimmed;
	});

	// Reset page when user-controlled filters change — separately from selection
	// so a data refresh doesn't jump back to page 1.
	$effect(() => {
		query;
		selectedStatuses;
		selectedProjectIds;
		selectedRegionIds;
		$omniQuery;
		$omniFilters;
		currentPage = 1;
	});

	const paginated = $derived(filtered.slice((currentPage - 1) * perPage, currentPage * perPage));
	const totalPages = $derived(Math.ceil(filtered.length / perPage));

	function pageWindow(): Array<number> {
		const pages: Array<number> = [];
		const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
		const end = Math.min(totalPages, Math.max(currentPage + 2, 5));
		for (let i = start; i <= end; i++) pages.push(i);
		return pages;
	}

	// ── select-all helpers ────────────────────────────────────────
	const pageIds = $derived(paginated.map((r) => r.metadata.id));
	const allPageSelected = $derived(
		pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id))
	);
	const somePageSelected = $derived(pageIds.some((id) => selectedIds.has(id)) && !allPageSelected);

	function toggleAll() {
		const s = new Set(selectedIds);
		if (allPageSelected) {
			pageIds.forEach((id) => s.delete(id));
		} else {
			pageIds.forEach((id) => s.add(id));
		}
		selectedIds = s;
	}

	const stats = $derived(computeStats(resources));
</script>

<ShellPageHeader {settings} {tools} />

<div class="stats">
	<div class="stat">
		<div class="stat__label">Total</div>
		<div class="stat__value">{stats.total}</div>
		{#if projects && projects.length > 0}
			<div class="stat__sub">
				across {projects.length} project{projects.length === 1 ? '' : 's'}
			</div>
		{/if}
	</div>
	<div class="stat">
		<div class="stat__label">Provisioned</div>
		<div class="stat__value ok">{stats.provisioned}</div>
		<div class="stat__sub up">● healthy</div>
	</div>
	<div class="stat">
		<div class="stat__label">Needs attention</div>
		<div class="stat__value" class:danger={stats.needsAttention > 0}>{stats.needsAttention}</div>
		{#if stats.needsAttention > 0}
			<div class="stat__sub down">
				● {[
					stats.errorCount > 0 ? `${stats.errorCount} error` : '',
					stats.stuckDeprovisioning > 0 ? `${stats.stuckDeprovisioning} stuck deprovisioning` : ''
				]
					.filter(Boolean)
					.join(' · ')}
			</div>
		{/if}
	</div>
	<div class="stat">
		<div class="stat__label">Recent (7d)</div>
		<div class="stat__value">{stats.recent}</div>
		<div class="stat__sub">in the last 7 days</div>
	</div>
</div>

<!-- Ribbon -->
<div class="toolbar">
	<!-- Search -->
	<div class="search-chip" class:search-chip--active={!!query}>
		<Icon name="search" size={13} class="search-icon" />
		<input type="search" class="search-chip__input" placeholder="Filter…" bind:value={query} />
		{#if query}
			<button class="search-chip__clear" onclick={() => (query = '')} aria-label="Clear">
				<Icon name="x" size={11} />
			</button>
		{/if}
	</div>

	<!-- Status filter -->
	<FilterChip
		icon="activity"
		label="Status"
		options={statusOptions}
		selected={selectedStatuses}
		onchange={(s) => (selectedStatuses = s)}
	/>

	<!-- Project filter — only useful when more than one project is in scope -->
	{#if projectOptions.length > 1}
		<FilterChip
			icon="folder"
			label="Project"
			options={projectOptions}
			selected={selectedProjectIds}
			onchange={(s) => (selectedProjectIds = s)}
		/>
	{/if}

	<!-- Region filter -->
	{#if regionOptions.length >= 1}
		<FilterChip
			icon="globe"
			label="Region"
			options={regionOptions}
			selected={selectedRegionIds}
			onchange={(s) => (selectedRegionIds = s)}
		/>
	{/if}

	<!-- Global clear -->
	{#if anyFilterActive}
		<button class="clear-btn" onclick={clearAll}>
			<Icon name="x" size={12} />Clear
		</button>
	{/if}

	<div class="spacer"></div>

	<span class="item-count">{filtered.length} item{filtered.length === 1 ? '' : 's'}</span>

	<div class="seg" role="group" aria-label="View">
		<button class:active={$view === 'cards'} onclick={() => ($view = 'cards')}>
			<Icon name="cards" size={14} />Cards
		</button>
		<button class:active={$view === 'table'} onclick={() => ($view = 'table')}>
			<Icon name="table" size={14} />Table
		</button>
	</div>
</div>

<!-- Content -->
{#if filtered.length === 0}
	{#if empty && resources.length === 0 && !anyFilterActive}
		{@render empty()}
	{:else}
		<p class="empty-filter">No resources match the current filters.</p>
	{/if}
{:else if $view === 'table'}
	<div class="table-wrap">
		<table class="table">
			<thead>
				<tr>
					{#if bulkbar}
						<th class="col-select">
							<input
								type="checkbox"
								class="checkbox"
								class:indet={somePageSelected}
								checked={allPageSelected}
								onchange={toggleAll}
							/>
						</th>
					{/if}
					{#if tableHeaders?.length}
						{#each tableHeaders as h}<th>{h}</th>{/each}
					{:else}
						<th>Name</th><th>Status</th><th>Age</th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each paginated as resource}
					<tr
						class:selected={selectedIds.has(resource.metadata.id)}
						class:has-err={resource.metadata.provisioningStatus === 'error'}
						class:has-warn={resource.metadata.provisioningStatus === 'deprovisioning'}
					>
						{#if bulkbar}
							<td class="col-select">
								<input
									type="checkbox"
									class="checkbox"
									checked={selectedIds.has(resource.metadata.id)}
									onchange={() => toggleId(resource.metadata.id)}
								/>
							</td>
						{/if}
						{#if tableRow}
							{@render tableRow(resource)}
						{:else}
							<td class="primary">{resource.metadata.name}</td>
							<td>{resource.metadata.provisioningStatus}</td>
							<td>{ageFormatter(resource.metadata.creationTime)}</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else if $view === 'grouped' && groups}
	{#each groups as group}
		<div class="group">
			<div class="group__head">
				<span class="group__title">{group.label}</span>
				<span class="group__meta"
					>{group.items.length} {group.items.length === 1 ? 'resource' : 'resources'}</span
				>
			</div>
			{@render list(group.items)}
		</div>
	{/each}
{:else}
	<!-- Cards view: select-all bar when bulk actions are enabled -->
	{#if bulkbar && paginated.length > 0}
		<div class="select-all-bar">
			<label class="select-all-bar__check">
				<input
					type="checkbox"
					class="checkbox"
					class:indet={somePageSelected}
					checked={allPageSelected}
					onchange={toggleAll}
				/>
				<span>
					{#if allPageSelected}
						All {pageIds.length} on this page selected
					{:else if somePageSelected}
						{pageIds.filter((id) => selectedIds.has(id)).length} of {pageIds.length} selected
					{:else}
						Select all {pageIds.length} on this page
					{/if}
				</span>
			</label>
		</div>
	{/if}
	{@render list(paginated)}
{/if}

<!-- Pagination -->
{#if totalPages > 1}
	<div class="pagination">
		<span>Rows per page</span>
		<select
			class="page-btn"
			bind:value={perPage}
			onchange={() => (currentPage = 1)}
			style="padding: 0 8px;"
		>
			{#each [10, 25, 50, 100] as n}<option value={n}>{n}</option>{/each}
		</select>
		<span class="spacer"></span>
		<span
			>{(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length}</span
		>
		<button
			class="page-btn"
			disabled={currentPage === 1}
			onclick={() => (currentPage = Math.max(1, currentPage - 1))}
		>
			<Icon name="chevronLeft" size={12} />
		</button>
		{#each pageWindow() as n}
			<button class="page-btn" class:active={n === currentPage} onclick={() => (currentPage = n)}>
				{n}
			</button>
		{/each}
		<button
			class="page-btn"
			disabled={currentPage === totalPages}
			onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
		>
			<Icon name="chevronRight" size={12} />
		</button>
	</div>
{/if}

<!-- Bulk action bar — slides up when any items are selected -->
{#if bulkbar && selectedIds.size > 0}
	<BulkBar count={selectedIds.size} onClear={clearSelection}>
		{#snippet actions()}
			{@render bulkbar({ ids: selectedIds, clear: clearSelection })}
		{/snippet}
	</BulkBar>
{/if}

<style>
	.warn {
		color: var(--danger);
	}

	.ok {
		color: var(--accent);
	}

	.danger {
		color: var(--danger);
	}

	.search-chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 28px;
		padding: 0 10px;
		border-radius: 8px;
		background: var(--bg-2);
		border: 1px dashed var(--line);
		color: var(--text-2);
		font-size: 12px;
		transition: border-color 120ms var(--ease);
		min-width: 140px;
	}

	.search-chip:focus-within,
	.search-chip--active {
		background: linear-gradient(180deg, var(--bg-3), var(--bg-2));
		border: 1px solid var(--line-strong);
		color: var(--text-1);
		box-shadow: var(--shadow-inset);
	}

	:global(.search-icon) {
		color: var(--text-4);
		flex-shrink: 0;
	}

	.search-chip__input {
		flex: 1;
		min-width: 0;
		background: transparent;
		border: 0;
		outline: 0;
		color: var(--text-1);
		font: inherit;
		font-size: 12px;
	}

	.search-chip__input::placeholder {
		color: var(--text-4);
	}

	.search-chip__clear {
		color: var(--text-4);
		display: flex;
		align-items: center;
	}
	.search-chip__clear:hover {
		color: var(--text-2);
	}

	.clear-btn {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		height: 28px;
		padding: 0 10px;
		border-radius: 8px;
		font-size: 12px;
		color: var(--text-3);
		border: 1px solid transparent;
		transition:
			color 120ms var(--ease),
			background 120ms var(--ease);
	}

	.clear-btn:hover {
		color: var(--text-1);
		background: var(--bg-2);
	}

	.item-count {
		font-size: 11.5px;
		color: var(--text-3);
		white-space: nowrap;
	}

	:global(.seg button) {
		display: inline-flex;
		align-items: center;
		gap: 5px;
	}

	.empty-filter {
		padding: 32px;
		text-align: center;
		font-size: 13px;
		color: var(--text-3);
	}

	.select-all-bar {
		display: flex;
		align-items: center;
		padding: 8px 4px;
		margin-bottom: 8px;
	}

	.select-all-bar__check {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		color: var(--text-3);
		cursor: pointer;
	}
</style>
