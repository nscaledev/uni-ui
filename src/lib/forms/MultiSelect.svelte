<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Combobox } from 'bits-ui';
	import Icon from '$lib/primitives/Icon.svelte';

	interface Option {
		label: string;
		value: string;
	}

	interface Props {
		value: Array<string>;
		onValueChange: (e: { value: Array<string> }) => void;
		label: string;
		hint?: string;
		options: Array<Option>;
		selected: Snippet<[string]>;
	}

	let { value, onValueChange, label, hint, options, selected }: Props = $props();

	let query = $state('');

	// Options not yet selected, filtered by current search query
	let available = $derived(
		options.filter(
			(o) => !value.includes(o.value) && o.label.toLowerCase().includes(query.toLowerCase())
		)
	);

	function remove(i: number) {
		onValueChange({ value: value.filter((_, j) => j !== i) });
	}

	function add(v: string[]) {
		// Bits UI passes the full selected array; we only care about new additions
		const added = v.filter((id) => !value.includes(id));
		if (added.length) {
			onValueChange({ value: [...value, ...added] });
			query = '';
		}
	}
</script>

<div class="form-row">
	<div class="form-row__left">
		<div class="form-row__title">{label}</div>
		{#if hint}<p class="form-row__hint">{hint}</p>{/if}
	</div>
	<div class="form-row__control">
		{#if value.length}
			<div class="ms-chips">
				{#each value as v, i}
					<div class="ms-chip">
						<span class="ms-chip__content">{@render selected(v)}</span>
						<button class="ms-chip__remove" onclick={() => remove(i)} aria-label="Remove">
							<Icon name="x" size={14} />
						</button>
					</div>
				{/each}
			</div>
		{/if}

		<Combobox.Root type="multiple" onValueChange={add} onOpenChange={() => (query = '')}>
			<div class="ms-input-wrap">
				<Icon name="search" size={14} class="ms-search-icon" />
				<Combobox.Input
					class="ms-input"
					placeholder="Search to add…"
					oninput={(e) => (query = (e.target as HTMLInputElement).value)}
					aria-label={label}
				/>
			</div>

			<Combobox.Content class="menu ms-menu" sideOffset={4}>
				{#if available.length}
					{#each available as option}
						<Combobox.Item value={option.value} label={option.label} class="menu__item">
							{option.label}
						</Combobox.Item>
					{/each}
				{:else}
					<div class="ms-empty">No options</div>
				{/if}
			</Combobox.Content>
		</Combobox.Root>
	</div>
</div>

<style>
	.form-row__left {
		padding-top: 2px;
	}

	.form-row__control {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	/* Selected chips */
	.ms-chips {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.ms-chip {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 8px 10px;
		background: var(--bg-2);
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		font-size: 13px;
		color: var(--text-1);
	}

	.ms-chip__content {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.ms-chip__remove {
		display: flex;
		align-items: center;
		color: var(--text-3);
		flex-shrink: 0;
		padding: 2px;
		border-radius: 4px;
	}

	.ms-chip__remove:hover {
		color: var(--danger);
		background: color-mix(in oklch, var(--danger) 12%, transparent);
	}

	/* Search input row */
	.ms-input-wrap {
		display: flex;
		align-items: center;
		gap: 8px;
		height: 34px;
		padding: 0 10px;
		border-radius: var(--r-md);
		background: var(--bg-1);
		border: 1px solid var(--line);
		box-shadow: var(--shadow-inset);
	}

	.ms-input-wrap:focus-within {
		border-color: color-mix(in oklch, var(--accent) 60%, var(--line));
		box-shadow:
			0 0 0 3px var(--accent-glow),
			var(--shadow-inset);
	}

	:global(.ms-search-icon) {
		color: var(--text-3);
		flex-shrink: 0;
	}

	:global(.ms-input) {
		flex: 1;
		background: transparent;
		border: 0;
		outline: 0;
		color: var(--text-1);
		font: inherit;
		font-size: 13px;
	}

	/* Dropdown */
	:global(.ms-menu) {
		width: var(--bits-combobox-content-available-width, 100%);
		max-height: 240px;
		overflow-y: auto;
		z-index: 50;
	}

	.ms-empty {
		padding: 8px 10px;
		font-size: 13px;
		color: var(--text-3);
	}
</style>
