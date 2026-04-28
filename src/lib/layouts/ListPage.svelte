<script lang="ts">
	import type { Snippet } from 'svelte';
	import { computeStats } from '$lib/layouts/stats';
	import type { ShellPageSettings } from '$lib/layouts/types';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import Icon from '$lib/primitives/Icon.svelte';

	interface Resource {
		metadata: { provisioningStatus: string; creationTime: Date; name: string };
	}

	interface Props {
		settings: ShellPageSettings;
		resources: Array<Resource>;
		// Filter predicate — return true to include. Default: filter by name substring.
		filterFn?: (r: Resource, query: string) => boolean;
		tools?: Snippet;
		list: Snippet<[Array<Resource>]>;
		empty?: Snippet;
	}

	let { settings, resources, filterFn, tools, list, empty }: Props = $props();

	let query = $state('');

	const filtered = $derived.by(() => {
		if (!query.trim()) return resources;
		const q = query.toLowerCase();
		const fn = filterFn ?? ((r: Resource) => r.metadata.name.toLowerCase().includes(q));
		return resources.filter((r) => fn(r, q));
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

<!-- Filter bar -->
<div class="filter-bar">
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
	{#if query && filtered.length !== resources.length}
		<span class="filter-bar__count">{filtered.length} of {resources.length}</span>
	{/if}
</div>

<!-- List content or empty state -->
{#if filtered.length > 0}
	{@render list(filtered)}
{:else if empty && resources.length === 0}
	{@render empty()}
{:else if query}
	<div class="filter-empty">No resources match "<strong>{query}</strong>"</div>
{/if}

<style>
	.warn {
		color: var(--danger);
	}

	:global(.filter-bar__icon) {
		color: var(--text-4);
		flex-shrink: 0;
	}

	.filter-bar {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 12px;
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
		flex: 1;
		max-width: 320px;
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

	.filter-bar__count {
		font-size: 12px;
		color: var(--text-3);
	}

	.filter-empty {
		padding: 24px;
		text-align: center;
		font-size: 13px;
		color: var(--text-3);
	}
</style>
