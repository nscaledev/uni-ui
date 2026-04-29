<script
	lang="ts"
	generics="T extends { metadata: { provisioningStatus: string; creationTime: Date; name: string } }"
>
	import type { Snippet } from 'svelte';
	import { computeStats } from '$lib/layouts/stats';
	import { ageFormatter } from '$lib/formatters';
	import type { ShellPageSettings } from '$lib/layouts/types';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import FilterChip from '$lib/forms/FilterChip.svelte';
	import Icon from '$lib/primitives/Icon.svelte';
	import * as Identity from '$lib/openapi/identity';
	import { countryFlag } from '$lib/regionutil';

	interface NamedItem {
		metadata: { id: string; name: string };
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
		empty
	}: Props = $props();

	type View = 'list' | 'table' | 'grouped';

	let query = $state('');
	let view = $state<View>('list');
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

	// Status options in design order with semantic pip colours.
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

	// Rotating palette for project pips — visually distinct, stays consistent by index.
	const PROJECT_PALETTE = [
		'oklch(0.65 0.18 220)', // blue
		'oklch(0.65 0.18 290)', // violet
		'oklch(0.68 0.16 30)', // orange
		'oklch(0.65 0.18 340)', // pink
		'oklch(0.65 0.16 170)', // teal
		'oklch(0.68 0.16 80)' // lime
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
		if (view === 'grouped' && !groupKey) view = 'list';
	});

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

		return r;
	});

	const groups = $derived.by(() => {
		if (view !== 'grouped' || !groupKey) return null;
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

	const stats = $derived(computeStats(resources));
</script>

<ShellPageHeader {settings} {tools} />

<div class="stats">
	<div class="stat">
		<div class="stat__label">Total</div>
		<div class="stat__value">{stats.total}</div>
	</div>
	<div class="stat">
		<div class="stat__label">Provisioned</div>
		<div class="stat__value">{stats.provisioned}</div>
	</div>
	<div class="stat">
		<div class="stat__label">Needs attention</div>
		<div class="stat__value" class:warn={stats.needsAttention > 0}>{stats.needsAttention}</div>
	</div>
	<div class="stat">
		<div class="stat__label">Recent (7d)</div>
		<div class="stat__value">{stats.recent}</div>
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

	<!-- Project filter -->
	{#if projectOptions.length >= 1}
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
		<button class:active={view === 'list'} onclick={() => (view = 'list')}>
			<Icon name="rows" size={14} />List
		</button>
		<button class:active={view === 'table'} onclick={() => (view = 'table')}>
			<Icon name="table" size={14} />Table
		</button>
		{#if groupKey}
			<button class:active={view === 'grouped'} onclick={() => (view = 'grouped')}>
				<Icon name="cards" size={14} />Grouped
			</button>
		{/if}
	</div>
</div>

<!-- Content -->
{#if filtered.length === 0}
	{#if empty && resources.length === 0 && !anyFilterActive}
		{@render empty()}
	{:else}
		<p class="empty-filter">No resources match the current filters.</p>
	{/if}
{:else if view === 'table'}
	<div class="table-wrap">
		<table class="table">
			<thead>
				<tr>
					{#if tableHeaders?.length}
						{#each tableHeaders as h}<th>{h}</th>{/each}
					{:else}
						<th>Name</th><th>Status</th><th>Age</th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each filtered as resource}
					{#if tableRow}
						{@render tableRow(resource)}
					{:else}
						<tr>
							<td class="primary">{resource.metadata.name}</td>
							<td>{resource.metadata.provisioningStatus}</td>
							<td>{ageFormatter(resource.metadata.creationTime)}</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</div>
{:else if view === 'grouped' && groups}
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
	{@render list(filtered)}
{/if}

<style>
	.warn {
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
</style>
