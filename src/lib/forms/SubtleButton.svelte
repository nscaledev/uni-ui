<script lang="ts">
	import Icon from '$lib/primitives/Icon.svelte';

	interface Props {
		icon: string;
		label: string;
		disabled?: boolean;
		href?: string;
		clicked?: () => void;
		[key: string]: any;
	}

	let { icon, label, disabled = $bindable(), href, clicked, ...props }: Props = $props();
</script>

{#snippet content()}
	<Icon name={icon} size={20} />
	{#if label}
		<div>{label}</div>
	{/if}
{/snippet}

{#if href}
	<a {href}>
		<div class="btn flex gap-2 items-center p-0 {props.class || ''}">
			{@render content()}
		</div>
	</a>
{:else if clicked}
	<button
		class="btn flex gap-2 items-center p-0 disabled:opacity-50 disabled:cursor-not-allowed {props.class ||
			''}"
		{disabled}
		onclick={clicked}
	>
		{@render content()}
	</button>
{/if}
