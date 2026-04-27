<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		// Label to attach describing the input.
		label: string;
		// The current value.
		value: string;
		// Called when the value changes.
		onValueChange: (e: { value: string }) => void;
		// A list of possible values to select.
		options: Array<string>;
		// Formatting hint.
		hint?: string;
		// Contents snippet.
		contents: Snippet<[string]>;
	}

	let { label, hint = '', value, onValueChange, options, contents }: Props = $props();

	import { Popover } from '@skeletonlabs/skeleton-svelte';

	let open = $state(false);

	function select(o: string) {
		onValueChange({ value: o });
		open = false;
	}
</script>

<div class="flex flex-col gap-1">
	<div>{label}</div>

	{#if hint}
		<div class="text-xs italic text-surface-700-300">{hint}</div>
	{/if}
</div>

<Popover
	{open}
	onOpenChange={(e) => (open = e.open)}
	contentBase="card bg-surface-50-950 p-2 shadow-xl"
	triggerBase="rounded p-2 preset-tonal border border-surface-500 shadow-lg w-full flex justify-between items-center"
>
	{#snippet trigger()}
		{@render contents(value)}
		<iconify-icon icon="ph:caret-down-bold"></iconify-icon>
	{/snippet}

	{#snippet content()}
		<div class="flex flex-col">
			{#each options as o}
				<button class="p-2 hover:bg-surface-100-900" onclick={() => select(o)}>
					{@render contents(o)}
				</button>
			{/each}
		</div>
	{/snippet}
</Popover>
