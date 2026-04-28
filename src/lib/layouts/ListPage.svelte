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
		// Override the default name-based filter with a custom predicate.
		filterFn?: (r: T, query: string) => boolean;
		tools?: Snippet;
		// Card list view (required).
		list: Snippet<[Array<T>]>;
		// Optional table view — presence enables the view switcher.
		tableRow?: Snippet<[T]>;
		// Table column headers (only used when tableRow is provided).
		tableHeaders?: Array<string>;
		empty?: Snippet;
	}

	let { settings, resources, filterFn, tools, list, tableRow, tableHeaders, empty }: Props =
		$props();

	let query = $state('');
	let statusFilter = $state<'all' | 'provisioned' | 'attention'>('all');
	let view = $state<'cards' | 'table'>('cards');

	const filtered = $derived.by(() => {
		let r = resources;

		// Status filter
		if (statusFilter === 'provisioned') {
			r = r.filter(
				(x) => x.metadata.provisioningStatus === Identity.ResourceProvisioningStatus.Provisioned
			);
		} else if (statusFilter === 'attention') {
			r = r.filter(
				(x) => x.metadata.provisioningStatus !== Identity.ResourceProvisioningStatus.Provisioned
			);
		}

		// Name search
		if (query.trim()) {
			const q = query.toLowerCase();
			const fn = filterFn ?? ((x: T) => x.metadata.name.toLowerCase().includes(q));
			r = r.filter((x) => fn(x, q));
		}

		return r;
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

<!-- Toolbar: search + filters + view switcher -->
<div class="toolbar">
	<!-- Search -->
	<div class="filter-bar__search">
		<Icon name="search" size={14} class="filter-bar__icon" />
		<input
			type="search"
			class="filter-bar__input"
			placeholder="Filter by name…"
			bind:value={query}
		/>
		{#if query}
			<button class="filter-bar__clear" onclick={() => (query = '')} aria-label="Clear filter">
				<Icon name="x" size={12} />
			</button>
		{/if}
	</div>

	<!-- Status filter chips -->
	<button
		class="filter-chip"
		class:active={statusFilter === 'provisioned'}
		onclick={() => (statusFilter = statusFilter === 'provisioned' ? 'all' : 'provisioned')}
	>
		<span class="chip-dot chip-dot--ok"></span>
		Provisioned
	</button>
	<button
		class="filter-chip"
		class:active={statusFilter === 'attention'}
		onclick={() => (statusFilter = statusFilter === 'attention' ? 'all' : 'attention')}
	>
		<span class="chip-dot chip-dot--warn"></span>
		Needs attention
	</button>

	{#if query && filtered.length !== resources.length}
		<span class="filter-count">{filtered.length} of {resources.length}</span>
	{/if}

	<div class="spacer"></div>

	<!-- View switcher (only when table view is provided) -->
	{#if tableRow}
		<div class="seg">
			<button class:active={view === 'cards'} onclick={() => (view = 'cards')} title="Card view">
				<Icon name="cards" size={14} />
			</button>
			<button class:active={view === 'table'} onclick={() => (view = 'table')} title="Table view">
				<Icon name="table" size={14} />
			</button>
		</div>
	{/if}
</div>

<!-- Content -->
{#if filtered.length > 0}
	{#if view === 'table' && tableRow}
		<div class="table-wrap">
			<table class="table">
				{#if tableHeaders?.length}
					<thead>
						<tr>
							{#each tableHeaders as h}
								<th>{h}</th>
							{/each}
						</tr>
					</thead>
				{/if}
				<tbody>
					{#each filtered as resource}
						{@render tableRow(resource)}
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		{@render list(filtered)}
	{/if}
{:else if empty && resources.length === 0 && statusFilter === 'all' && !query}
	{@render empty()}
{:else}
	<div class="filter-empty">
		{#if query}
			No resources match "<strong>{query}</strong>"
		{:else}
			No resources match the current filter.
		{/if}
	</div>
{/if}

<style>
	.warn {
		color: var(--danger);
	}

	:global(.filter-bar__icon) {
		color: var(--text-4);
		flex-shrink: 0;
	}

	.filter-bar__search {
		display: flex;
		align-items: center;
		gap: 8px;
		height: 32px;
		padding: 0 10px;
		background: var(--bg-1);
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		box-shadow: var(--shadow-inset);
		min-width: 200px;
		max-width: 280px;
		flex: 1;
	}

	.filter-bar__search:focus-within {
		border-color: color-mix(in oklch, var(--accent) 60%, var(--line));
	}

	.filter-bar__input {
		flex: 1;
		background: transparent;
		border: 0;
		outline: 0;
		color: var(--text-1);
		font: inherit;
		font-size: 13px;
		min-width: 0;
	}

	.filter-bar__input::placeholder {
		color: var(--text-4);
	}

	.filter-bar__clear {
		color: var(--text-4);
		display: flex;
		align-items: center;
	}

	.filter-bar__clear:hover {
		color: var(--text-2);
	}

	.filter-count {
		font-size: 12px;
		color: var(--text-3);
	}

	.chip-dot {
		width: 6px;
		height: 6px;
		border-radius: 999px;
		flex-shrink: 0;
	}

	.chip-dot--ok {
		background: var(--accent);
	}

	.chip-dot--warn {
		background: var(--warning, #f59e0b);
	}

	.filter-empty {
		padding: 32px;
		text-align: center;
		font-size: 13px;
		color: var(--text-3);
	}
</style>
