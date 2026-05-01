<script lang="ts">
	import FieldWrapper from '$lib/primitives/FieldWrapper.svelte';

	interface Props {
		value: number | undefined;
		label: string;
		hint?: string;
		min?: number;
		max?: number;
	}

	let { value = $bindable(), label, hint, min = 0, max }: Props = $props();
</script>

<FieldWrapper {label} {hint}>
	{#snippet control()}
		<div class="input"><input type="number" bind:value {min} {max} /></div>
	{/snippet}
</FieldWrapper>
