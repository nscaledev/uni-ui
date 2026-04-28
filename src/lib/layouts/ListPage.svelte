<script
	lang="ts"
	generics="T extends { metadata: { provisioningStatus: string; creationTime: Date; name: string } }"
>
	import type { Snippet } from 'svelte';
	import { computeStats } from '$lib/layouts/stats';
	import type { ShellPageSettings } from '$lib/layouts/types';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import Icon from '$lib/primitives/Icon.svelte';
	import * as Identity from '$lib/openapi/identity';

	interface Props {
		settings: ShellPageSettings;
		resources: Array<T>;
		// Override the default name-based filter.
		filterFn?: (r: T, query: string) => boolean;
		tools?: Snippet;
		// Card/list view (required).
		list: Snippet<[Array<T>]>;
		// Optional table view — presence adds the Table button to the view switcher.
		tableRow?: Snippet<[T]>;
		tableHeaders?: Array<string>;
		// Optional grouped view — presence adds the Grouped button to the view switcher.
		// Return the group key for a resource (e.g. projectId or region).
		groupKey?: (r: T) => string;
		// Display label for a group key (defaults to the raw key).
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

	type View = 'cards' | 'table' | 'grouped';

	let query = $state('');
	let statusFilter = $state<'all' | 'provisioned' | 'attention'>('all');
	let view = $state<View>('cards');

	// Available view options
	const views = $derived.by(() => {
		const v: Array<{ id: View; icon: string; label: string }> = [
			{ id: 'cards', icon: 'rows', label: 'List' }
		];
		if (tableRow) v.push({ id: 'table', icon: 'table', label: 'Table' });
		if (groupKey) v.push({ id: 'grouped', icon: 'cards', label: 'Grouped' });
		return v;
	});

	// Reset to cards if current view becomes unavailable
	$effect(() => {
		if (!views.find((v) => v.id === view)) view = 'cards';
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

	// Group the filtered array when in grouped view
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

<!-- Ribbon: filters left, view switcher right -->
<div class="toolbar">
	<!-- Search -->
	<div class="search-chip">
		<Icon name="search" size={13} class="search-chip__icon" />
		<input type="search" class="search-chip__input" placeholder="Filter…" bind:value={query} />
		{#if query}
			<button class="search-chip__clear" onclick={() => (query = '')} aria-label="Clear">
				<Icon name="x" size={11} />
			</button>
		{/if}
	</div>

	<!-- Status filter chips -->
	<button
		class="filter-chip"
		class:active={statusFilter === 'provisioned'}
		onclick={() => (statusFilter = statusFilter === 'provisioned' ? 'all' : 'provisioned')}
	>
		<span class="status-dot status-dot--ok"></span>
		Provisioned
	</button>
	<button
		class="filter-chip"
		class:active={statusFilter === 'attention'}
		onclick={() => (statusFilter = statusFilter === 'attention' ? 'all' : 'attention')}
	>
		<span class="status-dot status-dot--warn"></span>
		Needs attention
	</button>

	{#if query && filtered.length !== resources.length}
		<span class="match-count">{filtered.length} of {resources.length}</span>
	{/if}

	<div class="spacer"></div>

	<!-- View switcher — only when more than one view is available -->
	{#if views.length > 1}
		<div class="seg" role="group" aria-label="View">
			{#each views as v}
				<button
					class:active={view === v.id}
					onclick={() => (view = v.id)}
					title={v.label}
					aria-pressed={view === v.id}
				>
					<Icon name={v.icon} size={14} />
				</button>
			{/each}
		</div>
	{/if}
</div>

<!-- Content -->
{#if filtered.length === 0}
	{#if empty && resources.length === 0 && statusFilter === 'all' && !query}
		{@render empty()}
	{:else}
		<div class="empty-filter">
			{#if query}No resources match "<strong>{query}</strong>"{:else}No resources match the current
				filter.{/if}
		</div>
	{/if}
{:else if view === 'table' && tableRow}
	<div class="table-wrap">
		<table class="table">
			{#if tableHeaders?.length}
				<thead>
					<tr
						>{#each tableHeaders as h}<th>{h}</th>{/each}</tr
					>
				</thead>
			{/if}
			<tbody>
				{#each filtered as resource}{@render tableRow(resource)}{/each}
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

	/* Compact search input styled to sit beside filter chips */
	.search-chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 28px;
		padding: 0 10px;
		border-radius: 8px;
		background: var(--bg-2);
		border: 1px solid var(--line);
		box-shadow: var(--shadow-inset);
		transition: border-color 120ms var(--ease);
		min-width: 160px;
	}

	.search-chip:focus-within {
		border-color: color-mix(in oklch, var(--accent) 60%, var(--line));
		box-shadow:
			0 0 0 3px var(--accent-glow),
			var(--shadow-inset);
	}

	:global(.search-chip__icon) {
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

	.status-dot {
		width: 6px;
		height: 6px;
		border-radius: 999px;
		flex-shrink: 0;
	}

	.status-dot--ok {
		background: var(--accent);
	}
	.status-dot--warn {
		background: var(--warning, oklch(0.75 0.15 60));
	}

	.match-count {
		font-size: 11.5px;
		color: var(--text-3);
	}

	.empty-filter {
		padding: 32px;
		text-align: center;
		font-size: 13px;
		color: var(--text-3);
	}
</style>
