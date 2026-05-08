<script lang="ts">
	import Icon from '$lib/primitives/Icon.svelte';

	interface Props {
		icon: string;
		label?: string;
		disabled?: boolean;
		href?: string;
		clicked?: () => void;
		class?: string;
	}

	let {
		icon,
		label,
		disabled = $bindable(false),
		href,
		clicked,
		class: cls = ''
	}: Props = $props();
</script>

{#snippet content()}
	<Icon name={icon} size={16} />
	{#if label}<span>{label}</span>{/if}
{/snippet}

{#if href}
	<a {href} class="btn btn--ghost {cls}">
		{@render content()}
	</a>
{:else}
	<button class="btn btn--ghost {cls}" {disabled} onclick={clicked}>
		{@render content()}
	</button>
{/if}
