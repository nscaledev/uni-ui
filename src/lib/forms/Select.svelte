<script lang="ts">
	interface Props {
		value: string | undefined;
		label: string;
		hint?: string;
		disabled?: boolean;
		children?: import('svelte').Snippet;
	}

	let { value = $bindable(), label, hint = '', disabled = false, children }: Props = $props();
</script>

<div class="form-row">
	<div class="form-row__left">
		<div class="form-row__title">{label}</div>
		{#if hint}
			<div class="form-row__hint">{hint}</div>
		{/if}
	</div>
	<div class="form-row__control">
		<select class="select-native" {disabled} bind:value>
			{@render children?.()}
		</select>
	</div>
</div>

<style>
	.form-row__left {
		padding-top: 2px;
	}

	.select-native {
		width: 100%;
		height: 34px;
		padding: 0 10px;
		background: var(--bg-1);
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		box-shadow: var(--shadow-inset);
		color: var(--text-1);
		font: inherit;
		font-size: 13px;
		cursor: pointer;
		appearance: none;
		-webkit-appearance: none;
		background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'><path d='M2 4l4 4 4-4' stroke='%236b7280' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>");
		background-repeat: no-repeat;
		background-position: right 10px center;
		padding-right: 28px;
		transition: border-color 120ms var(--ease);
	}

	.select-native:focus {
		outline: 0;
		border-color: color-mix(in oklch, var(--accent) 60%, var(--line));
		box-shadow:
			0 0 0 3px var(--accent-glow),
			var(--shadow-inset);
	}

	.select-native:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
