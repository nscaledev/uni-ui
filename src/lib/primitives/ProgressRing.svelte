<script lang="ts">
	interface Props {
		// 0–100
		value: number;
		size?: number;
		strokeWidth?: number;
		showLabel?: boolean;
	}

	let { value, size = 80, strokeWidth = 8, showLabel = false }: Props = $props();

	const radius = $derived((size - strokeWidth) / 2);
	const circumference = $derived(2 * Math.PI * radius);
	const dash = $derived((Math.min(100, Math.max(0, value)) / 100) * circumference);
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 {size} {size}"
	aria-valuenow={value}
	aria-valuemin={0}
	aria-valuemax={100}
	role="meter"
>
	<!-- Track -->
	<circle
		cx={size / 2}
		cy={size / 2}
		r={radius}
		fill="none"
		stroke="var(--line)"
		stroke-width={strokeWidth}
	/>
	<!-- Fill -->
	<circle
		cx={size / 2}
		cy={size / 2}
		r={radius}
		fill="none"
		stroke="var(--accent)"
		stroke-width={strokeWidth}
		stroke-linecap="round"
		stroke-dasharray="{dash} {circumference}"
		transform="rotate(-90 {size / 2} {size / 2})"
		style="transition: stroke-dasharray 400ms var(--ease);"
	/>
	{#if showLabel}
		<text
			x={size / 2}
			y={size / 2}
			text-anchor="middle"
			dominant-baseline="central"
			fill="var(--text-1)"
			font-size={size * 0.22}
			font-family="var(--font-sans)"
			font-weight="600">{value}%</text
		>
	{/if}
</svg>
