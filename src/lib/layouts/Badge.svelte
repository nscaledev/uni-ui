<script lang="ts">
	import Icon from '$lib/primitives/Icon.svelte';

	interface Props {
		icon?: string;
		iconcolor?: string;
		children?: import('svelte').Snippet;
	}

	let { icon = '', iconcolor = '', children }: Props = $props();
</script>

<div class="badge border border-surface-200-800 shadow flex gap-2 items-center">
	{#if icon !== ''}
		<Icon name={icon} size={16} class={iconcolor} />
	{/if}

	{@render children?.()}
</div>
