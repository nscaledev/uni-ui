<script
	lang="ts"
	generics="T extends { metadata: { provisioningStatus: string; creationTime: Date; name: string } }"
>
	import type { Snippet } from 'svelte';
	import { computeStats } from '$lib/layouts/stats';
	import { ageFormatter } from '$lib/formatters';
	import type { ShellPageSettings } from '$lib/layouts/types';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import Icon from '$lib/primitives/Icon.svelte';
	import * as Identity from '$lib/openapi/identity';

	interface Props {
		settings: ShellPageSettings;
		resources: Array<T>;
		filterFn?: (r: T, query: string) => boolean;
		tools?: Snippet;
		// Required: card / list view.
		list: Snippet<[Array<T>]>;
		// Optional: custom table row. When absent a generic name/status/age table is shown.
		tableRow?: Snippet<[T]>;
		tableHeaders?: Array<string>;
		// Optional: enables grouped view. Return the group key for each resource.
		groupKey?: (r: T) => string;
		groupLabel?: (key: string) => string;
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
		empty
	}: Props = $props();

	type View = 'list' | 'table' | 'grouped';

	let query = $state('');
	let statusFilter = $state<'all' | 'provisioned' | 'attention'>('all');
	let view = $state<View>('list');

	// Reset grouped view if groupKey prop is removed
	$effect(() => {
		if (view === 'grouped' && !groupKey) view = 'list';
	});

	const filtered = $derived.by(() => {
		let r = resources;
		if (statusFilter === 'provisioned') {
			r = r.filter(
				(x) => x.metadata.provisioningStatus === Identity.ResourceProvisioningStatus.Provisioned
			);
		} else if (statusFilter === 'attention') {
			r = r.filter(
				(x) => x.metadata.provisioningStatus !== Identity.ResourceProvisioningStatus.Provisioned
			);
		}
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

<ShellPageHeader {settings}>
	{#if tools}
		{#snippet tools()}
			{@render tools?.()}
		{/snippet}
	{/if}
</ShellPageHeader>

<!-- Stats row -->
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
	<!-- Search chip -->
	<div class="search-chip" class:search-chip--active={!!query}>
		<Icon name="search" size={13} class="search-icon" />
		<input type="search" class="search-chip__input" placeholder="Filter…" bind:value={query} />
		{#if query}
			<button class="search-chip__clear" onclick={() => (query = '')} aria-label="Clear">
				<Icon name="x" size={11} />
			</button>
		{/if}
	</div>

	<!-- Status chips -->
	<button
		class="filter-chip"
		class:active={statusFilter === 'provisioned'}
		onclick={() => (statusFilter = statusFilter === 'provisioned' ? 'all' : 'provisioned')}
	>
		<span class="dot dot--ok"></span>Provisioned
	</button>
	<button
		class="filter-chip"
		class:active={statusFilter === 'attention'}
		onclick={() => (statusFilter = statusFilter === 'attention' ? 'all' : 'attention')}
	>
		<span class="dot dot--warn"></span>Needs attention
	</button>

	<div class="spacer"></div>

	<!-- Item count -->
	<span class="item-count">
		{filtered.length} item{filtered.length === 1 ? '' : 's'}
	</span>

	<!-- View switcher: list + table always; grouped when groupKey provided -->
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
	{#if empty && resources.length === 0 && statusFilter === 'all' && !query}
		{@render empty()}
	{:else}
		<p class="empty-filter">
			{#if query}No resources match "<strong>{query}</strong>"{:else}No resources match the current
				filter.{/if}
		</p>
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

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 999px;
		flex-shrink: 0;
	}

	.dot--ok {
		background: var(--accent);
	}
	.dot--warn {
		background: oklch(0.75 0.15 60);
	}

	.item-count {
		font-size: 11.5px;
		color: var(--text-3);
		white-space: nowrap;
	}

	/* Icon + label gap inside .seg buttons */
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
