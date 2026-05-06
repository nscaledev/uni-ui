<script lang="ts">
	import FieldWrapper from '$lib/primitives/FieldWrapper.svelte';

	interface Props {
		value: string | undefined;
		label: string;
		hint?: string;
		placeholder?: string;
		rows?: number;
	}

	let { value = $bindable(), label, hint, placeholder = '', rows = 6 }: Props = $props();
</script>

<FieldWrapper {label} {hint}>
	{#snippet control()}
		<textarea class="input textarea" {placeholder} {rows} bind:value></textarea>
	{/snippet}
</FieldWrapper>

<style>
	.textarea {
		resize: vertical;
		font-family: var(--font-mono, monospace);
		font-size: 12px;
		line-height: 1.5;
		padding: 8px 10px;
		width: 100%;
		box-sizing: border-box;
		min-height: 120px;
	}
</style>
