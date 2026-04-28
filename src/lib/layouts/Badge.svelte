<script lang="ts">
	import Icon from '$lib/primitives/Icon.svelte';

	interface Props {
		// Icon name (canonical Icon.svelte name). Empty string = no icon.
		icon?: string;
		// CSS class applied to the icon (e.g. Tailwind color class during migration).
		iconcolor?: string;
		children?: import('svelte').Snippet;
	}

	let { icon = '', iconcolor = '', children }: Props = $props();
</script>

<span class="badge">
	{#if icon !== ''}
		<Icon name={icon} size={14} class={iconcolor} />
	{/if}
	{@render children?.()}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		height: 22px;
		padding: 0 8px;
		border-radius: 999px;
		font-size: 11.5px;
		font-weight: 500;
		color: var(--text-2);
		background: linear-gradient(180deg, var(--bg-3), var(--bg-2));
		border: 1px solid var(--line);
		box-shadow: var(--shadow-inset);
		white-space: nowrap;
	}
</style>
