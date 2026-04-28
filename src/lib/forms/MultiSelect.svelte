<script lang="ts">
	import type { Snippet } from 'svelte';

	import { Combobox } from '@skeletonlabs/skeleton-svelte';
	import Icon from '$lib/primitives/Icon.svelte';

	interface ComboData {
		label: string;
		value: string;
	}

	interface Props {
		// Value to bind to.
		value: Array<string>;
		// Pass the new array up to the client.
		onValueChange: (e: { value: Array<string> }) => void;
		// Label to attach describing the input.
		label: string;
		// Formatting hint.
		hint?: string;
		// List of all possible options.
		options: Array<ComboData>;
		// Rendering snippet for a selected item.
		selected: Snippet<[string]>;
	}

	let { value, onValueChange, label, hint = '', options, selected }: Props = $props();

	function remove(i: number) {
		let mutated = [] as Array<string>;

		for (let j = 0; j < value.length; j++) {
			if (j == i) continue;

			mutated.push(value[j]);
		}

		onValueChange({ value: mutated });
	}
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-col gap-1">
		{label}

		{#if hint}
			<div class="text-xs italic text-surface-700-300">{hint}</div>
		{/if}
	</div>

	<div class="flex flex-col gap-2">
		{#each value as v, i}
			<div class="card shadow-lg bg-surface-50-950 flex justify-between items-center p-3">
				{@render selected(v)}
				<button onclick={() => remove(i)} aria-label="Remove item">
					<Icon name="trash" size={18} />
				</button>
			</div>
		{/each}
	</div>

	<div class="inline-flex flex-col">
		<Combobox data={options} {value} {onValueChange} multiple={true} />
	</div>
</div>
