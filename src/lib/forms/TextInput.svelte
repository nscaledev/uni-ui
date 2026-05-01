<script lang="ts">
	import * as Validation from '$lib/validation';
	import FieldWrapper from '$lib/primitives/FieldWrapper.svelte';

	interface Props {
		value: string | undefined;
		label: string;
		hint?: string;
		placeholder?: string;
		validators?: Validation.StringValidators;
		valid?: boolean;
	}

	let {
		value = $bindable(),
		label,
		hint,
		placeholder = '',
		validators = [],
		valid = $bindable(false)
	}: Props = $props();

	$effect.pre(() => {
		valid = Validation.validateString(value || '', validators);
	});
</script>

<FieldWrapper {label} {hint} {valid} showValidation={validators.length > 0}>
	{#snippet control()}
		{#if validators.length}
			<input type="text" {placeholder} bind:value />
		{:else}
			<div class="input"><input type="text" {placeholder} bind:value /></div>
		{/if}
	{/snippet}
</FieldWrapper>
