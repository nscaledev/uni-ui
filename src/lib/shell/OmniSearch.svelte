<script lang="ts">
	import { browser } from '$app/environment';
	import Icon from '$lib/primitives/Icon.svelte';
	import { omniQuery, omniFilters } from '$lib/stores/search';
	import * as Identity from '$lib/openapi/identity';

	const FILTER_KEYS = ['status', 'project', 'region'] as const;
	type FilterKey = (typeof FILTER_KEYS)[number];

	const STATUS_VALUES = Object.values(Identity.ResourceProvisioningStatus).filter(
		(v) => v !== Identity.ResourceProvisioningStatus.Unknown
	);

	const FILTER_HINTS: Record<FilterKey, string> = {
		status: 'provisioning state',
		project: 'project name',
		region: 'region identifier'
	};

	let inputEl: HTMLInputElement;
	let focused = $state(false);

	// Parse what the user is currently typing.
	const activeKey = $derived.by<{ key: FilterKey; partial: string } | null>(() => {
		const m = $omniQuery.match(/^(\w+):(.*)$/);
		if (m && (FILTER_KEYS as readonly string[]).includes(m[1]))
			return { key: m[1] as FilterKey, partial: m[2] };
		return null;
	});

	// Value suggestions when a valid key prefix is typed.
	const valueSuggestions = $derived.by<Array<string> | null>(() => {
		if (!activeKey) return null;
		if (activeKey.key === 'status') {
			const p = activeKey.partial.toLowerCase();
			return STATUS_VALUES.filter((v) => !p || v.toLowerCase().includes(p));
		}
		return null; // project/region: no data available in header; user types manually
	});

	const showPanel = $derived(focused && ($omniQuery === '' || activeKey !== null));

	function applyKey(key: FilterKey) {
		omniQuery.set(`${key}:`);
		inputEl.focus();
	}

	function applyValue(key: FilterKey, value: string) {
		omniFilters.update((f) => [...f, { key, value }]);
		omniQuery.set('');
		inputEl.focus();
	}

	function removeFilter(i: number) {
		omniFilters.update((f) => f.filter((_, j) => j !== i));
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Backspace' && $omniQuery === '' && $omniFilters.length > 0) {
			omniFilters.update((f) => f.slice(0, -1));
		}
		if (e.key === 'Enter' && activeKey && valueSuggestions === null) {
			// project: or region: typed manually — commit on Enter
			const value = activeKey.partial.trim();
			if (value) applyValue(activeKey.key, value);
		}
		if (e.key === 'Escape') {
			inputEl.blur();
			omniQuery.set('');
		}
	}

	if (browser) {
		window.addEventListener('keydown', (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				inputEl?.focus();
			}
		});
	}
</script>

<div class="omni" role="search" onclick={() => inputEl.focus()}>
	<Icon name="search" size={15} />

	{#each $omniFilters as filter, i}
		<span class="omni__token">
			<b>{filter.key}:</b>{filter.value}
			<button
				onclick={(e) => {
					e.stopPropagation();
					removeFilter(i);
				}}
				aria-label="Remove filter"
			>
				<Icon name="x" size={10} />
			</button>
		</span>
	{/each}

	<input
		bind:this={inputEl}
		class="omni__input"
		type="text"
		placeholder={$omniFilters.length ? '' : 'Search…   status:  project:  region:'}
		bind:value={$omniQuery}
		{onkeydown}
		onfocus={() => (focused = true)}
		onblur={() => (focused = false)}
	/>

	<span class="kbd">⌘K</span>

	{#if showPanel}
		<!-- onmousedown preventDefault keeps the input focused when clicking suggestions -->
		<div class="omni__panel" onmousedown={(e) => e.preventDefault()}>
			{#if $omniQuery === ''}
				<!-- Empty state: show available filter keys -->
				<div class="omni__group-title">Filters</div>
				{#each FILTER_KEYS as key}
					<div class="omni__row" role="option" aria-selected="false" onclick={() => applyKey(key)}>
						<Icon name="command" size={14} />
						<span class="mono">{key}:</span>
						<span class="meta">{FILTER_HINTS[key]}</span>
					</div>
				{/each}
			{:else if activeKey && valueSuggestions !== null}
				<!-- status: → list values -->
				<div class="omni__group-title">{activeKey.key}</div>
				{#if valueSuggestions.length === 0}
					<div class="omni__row" style="color: var(--text-3); cursor: default;">No matches</div>
				{:else}
					{#each valueSuggestions as val}
						<div
							class="omni__row"
							role="option"
							aria-selected="false"
							onclick={() => applyValue(activeKey.key, val)}
						>
							<Icon name="activity" size={14} />
							<span class="mono">{val}</span>
						</div>
					{/each}
				{/if}
			{:else if activeKey && valueSuggestions === null}
				<!-- project: / region: — manual entry hint -->
				<div class="omni__group-title">{activeKey.key}</div>
				<div class="omni__row" style="color: var(--text-3); cursor: default; font-size: 12px;">
					<Icon name="edit" size={14} />
					Type a value and press Enter
				</div>
			{/if}
		</div>
	{/if}
</div>
