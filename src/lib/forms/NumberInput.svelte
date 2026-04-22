<script lang="ts">
	interface Props {
		// Value to bind to.
		value: number | undefined;
		// Label to attach describing the input.
		label: string;
		// Formatting hint.
		hint?: string;
		min?: number;
		max?: number;
	}

	let { value = $bindable(), label, hint = '', min = 0, max }: Props = $props();
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-col gap-1">
		{label}

		{#if hint}
			<div class="text-xs italic text-surface-700-300">{hint}</div>
		{/if}
	</div>

	<input class="input shadow-lg" type="number" bind:value {min} {max} />
</div>
