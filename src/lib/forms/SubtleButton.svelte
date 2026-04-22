<script lang="ts">
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
	<iconify-icon {icon} class="text-2xl"></iconify-icon>
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
		class="btn flex gap-2 items-center p-0 {props.class || ''}"
		{disabled}
		onclick={clicked}
		onkeypress={clicked}
	>
		{@render content()}
	</button>
{/if}
