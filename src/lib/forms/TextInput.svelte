<script lang="ts">
	import * as Validation from '$lib/validation';

	interface Props {
		// Value to bind to.
		value: string | undefined;
		// Label to attach describing the input.
		label: string;
		// Formatting hint.
		hint?: string;
		// Placeholder.
		placeholder?: string;
		// A list of validators to apply to the input.
		validators?: Validation.StringValidators;
		// A valid flag to bind to.
		valid?: boolean;
	}

	let {
		value = $bindable(),
		label,
		hint = '',
		placeholder = '',
		validators = [],
		valid = $bindable(false)
	}: Props = $props();

	// Update the validation information when the value changes.
	$effect.pre(() => {
		valid = Validation.validateString(value || '', validators);
	});
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-col gap-1">
		{label}

		{#if hint}
			<div class="text-xs italic text-surface-700-300">{hint}</div>
		{/if}
	</div>

	{#if validators.length}
		<div class="input-group grid-cols-[1fr_auto] shadow-lg">
			<input class="ig-input" type="text" {placeholder} bind:value />
			<div class="ig-cell">
				{#if valid}
					<iconify-icon class="text-success-500 text-lg" icon="mdi:tick-circle-outline"
					></iconify-icon>
				{:else}
					<iconify-icon class="text-error-500 text-lg" icon="mdi:error-outline"></iconify-icon>
				{/if}
			</div>
		</div>
	{:else}
		<input class="input shadow-lg" type="text" {placeholder} bind:value />
	{/if}
</div>
