<script lang="ts">
	interface Props {
		icon: string;
		disabled?: boolean;
		clicked: () => void;
		[key: string]: any;
	}

	let { icon, disabled = $bindable(), href, clicked, ...props }: Props = $props();
</script>

{#snippet content()}
	<iconify-icon {icon} class="text-2xl"></iconify-icon>
{/snippet}

<button class="btn flex gap-2 items-center p-0 {props.class || ''}" {disabled} onclick={clicked}>
	{@render content()}
</button>
