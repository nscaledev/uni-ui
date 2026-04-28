<script lang="ts">
	import { Slider } from 'bits-ui';
	import type { NumberFormatter } from '$lib/formatters';

	interface Props {
		name?: string;
		label: string;
		hint?: string;
		min: number;
		max: number;
		step: number;
		// Array to support both single-thumb [n] and range [min, max] sliders.
		value: Array<number>;
		onValueChange: (e: { value: Array<number> }) => void;
		formatter?: NumberFormatter | null;
	}

	let {
		name,
		label,
		hint,
		min,
		max,
		step,
		value,
		onValueChange,
		formatter = null
	}: Props = $props();

	function displayValue(): string {
		if (formatter) return formatter(value[0]);
		return value.map(String).join(' – ');
	}
</script>

<div class="range-field">
	<div class="range-field__header">
		<div class="range-field__label">{label}</div>
		<div class="range-field__value">{displayValue()}</div>
	</div>

	{#if hint}
		<p class="range-field__hint">{hint}</p>
	{/if}

	<Slider.Root
		type="multiple"
		{min}
		{max}
		{step}
		{value}
		onValueChange={(v) => onValueChange({ value: v })}
		class="slider"
	>
		{#snippet children({ thumbItems })}
			<span class="slider__track">
				<Slider.Range class="slider__range" />
			</span>
			{#each thumbItems as thumb}
				<Slider.Thumb index={thumb.index} class="slider__thumb" />
			{/each}
		{/snippet}
	</Slider.Root>
</div>

<style>
	.range-field {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.range-field__header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 8px;
	}

	.range-field__label {
		font-size: 13px;
		font-weight: 500;
		color: var(--text-1);
	}

	.range-field__value {
		font-size: 12px;
		font-family: var(--font-mono);
		color: var(--accent);
		flex-shrink: 0;
	}

	.range-field__hint {
		font-size: 11.5px;
		color: var(--text-3);
		line-height: 1.45;
		margin: 0;
	}

	/* Slider track, range fill and thumb — styled globally since Bits UI
	   renders these elements outside the component's scoped CSS boundary. */
	:global(.slider) {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
		height: 20px;
		touch-action: none;
		user-select: none;
	}

	:global(.slider__track) {
		position: relative;
		flex: 1;
		height: 4px;
		border-radius: 2px;
		background: var(--bg-3);
		border: 1px solid var(--line);
	}

	:global(.slider__range) {
		position: absolute;
		height: 100%;
		border-radius: 2px;
		background: var(--accent);
	}

	:global(.slider__thumb) {
		display: block;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--bg-1);
		border: 2px solid var(--accent);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
		cursor: grab;
		transition: box-shadow 120ms var(--ease);
	}

	:global(.slider__thumb:focus-visible) {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	:global(.slider__thumb:active) {
		cursor: grabbing;
		box-shadow: 0 0 0 4px var(--accent-glow);
	}
</style>
