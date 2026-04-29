<script lang="ts">
	import { browser } from '$app/environment';
	import Icon from '$lib/primitives/Icon.svelte';
	import { omniQuery, omniFilters } from '$lib/stores/search';

	const FILTER_KEYS = ['status', 'project', 'region'] as const;
	type FilterKey = (typeof FILTER_KEYS)[number];

	let inputEl: HTMLInputElement;

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Backspace' && $omniQuery === '' && $omniFilters.length > 0) {
			omniFilters.update((f) => f.slice(0, -1));
		}
		if (e.key === 'Enter') {
			const m = $omniQuery.match(/^(\w+):(.+)$/);
			if (m && (FILTER_KEYS as readonly string[]).includes(m[1])) {
				omniFilters.update((f) => [...f, { key: m[1] as FilterKey, value: m[2].trim() }]);
				omniQuery.set('');
			}
		}
		if (e.key === 'Escape') {
			inputEl.blur();
			omniQuery.set('');
		}
	}

	function removeFilter(i: number) {
		omniFilters.update((f) => f.filter((_, j) => j !== i));
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
		placeholder={$omniFilters.length
			? ''
			: 'Search…   try status:error  project:platform  region:gb-north-1'}
		bind:value={$omniQuery}
		{onkeydown}
	/>

	<span class="kbd">⌘K</span>
</div>
