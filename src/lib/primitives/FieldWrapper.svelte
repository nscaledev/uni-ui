<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '$lib/primitives/Icon.svelte';

	interface Props {
		label: string;
		hint?: string;
		valid?: boolean;
		showValidation?: boolean;
		control: Snippet;
	}

	let { label, hint, valid, showValidation = false, control }: Props = $props();
</script>

<div class="form-row">
	<div class="form-row__left">
		<div class="form-row__title">{label}</div>
		{#if hint}
			<div class="form-row__hint">{hint}</div>
		{/if}
	</div>

	<div class="form-row__control">
		{#if showValidation}
			<div class="field__validated">
				{@render control()}
				<div class="field__status" class:ok={valid} class:err={!valid}>
					{#if valid}
						<Icon name="checkCircle" size={16} />
					{:else}
						<Icon name="alert" size={16} />
					{/if}
				</div>
			</div>
		{:else}
			{@render control()}
		{/if}
	</div>
</div>

<style>
	.form-row__left {
		padding-top: 2px;
	}

	/* Validated wrapper: shares .input chrome, validation icon on right */
	.field__validated {
		display: flex;
		align-items: center;
		background: var(--bg-1);
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		box-shadow: var(--shadow-inset);
		transition: border-color 120ms var(--ease);
	}

	.field__validated:focus-within {
		border-color: color-mix(in oklch, var(--accent) 60%, var(--line));
		box-shadow:
			0 0 0 3px var(--accent-glow),
			var(--shadow-inset);
	}

	.field__validated :global(input) {
		flex: 1;
		min-width: 0;
		height: 34px;
		padding: 0 10px;
		background: transparent;
		border: 0;
		outline: 0;
		color: var(--text-1);
		font: inherit;
	}

	.field__status {
		display: flex;
		align-items: center;
		padding: 0 8px;
		flex-shrink: 0;
	}

	.field__status.ok {
		color: var(--success, #4ade80);
	}
	.field__status.err {
		color: var(--danger);
	}
</style>
