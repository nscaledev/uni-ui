<script lang="ts">
	import type { Snippet } from 'svelte';

	import Button from '$lib/forms/Button.svelte';

	interface Props {
		// Defines the number of steps that are required as I cannot
		// see a way of deriving this from 'children' as it's already
		// a snippet.
		steps: number;
		// Defines the step we are on, should be initializes to
		// $state(0) by the parent.
		step: number;
		// content conditionally renders content based on the step number.
		content: Snippet<[number]>;
		// callback to be triggered when the stepper has been completed.
		complete: () => void;
		// provides optional validation to the parent and is typically used
		// in conjunction with the current step property.
		valid?: boolean;
	}

	let { step = $bindable(), steps, content, complete, valid = true }: Props = $props();

	let rightLabel: string = $derived(step === steps - 1 ? 'Submit' : 'Next');

	function left() {
		if (step > 0) step--;
	}

	function right() {
		if (step === steps - 1) {
			complete();
			return;
		}

		step++;
	}
</script>

<div class="flex flex-col gap-8">
	{@render content(step)}

	<div class="flex justify-between">
		<Button
			icon="mdi:arrow-left"
			label="Previous"
			class="preset-outlined-surface-600-400 shadow-lg"
			clicked={left}
			disabled={step === 0}
		/>
		<Button
			icon="mdi:arrow-right"
			label={rightLabel}
			class="preset-filled-primary-500 shadow-lg"
			clicked={right}
			disabled={!valid}
		/>
	</div>
</div>
