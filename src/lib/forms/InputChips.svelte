<script lang="ts">
	import { TagsInput } from '@skeletonlabs/skeleton-svelte';

	interface Props {
		// Unique element name.
		name: string;
		// Value to bind to.
		value: Array<string> | undefined;
		// Label to attach describing the input.
		label: string;
		// Formatting hint.
		hint?: string;
	}

	let { name, value = $bindable(), label, hint = '' }: Props = $props();
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-col gap-1">
		<div>{label}</div>

		{#if hint}
			<div class="text-xs italic text-surface-700-300">{hint}</div>
		{/if}
	</div>

	<TagsInput {value} onValueChange={(e) => (value = e.value)} />
</div>
