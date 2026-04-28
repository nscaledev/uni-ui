<script lang="ts">
	import FieldWrapper from '$lib/primitives/FieldWrapper.svelte';

	interface Props {
		value: number;
		label: string;
		hint?: string;
		min?: number;
		max?: number;
	}

	let { value = $bindable(), label, hint, min = 0, max }: Props = $props();
</script>

<FieldWrapper {label} {hint}>
	{#snippet control()}
		<input class="input" type="number" bind:value {min} {max} />
	{/snippet}
</FieldWrapper>
