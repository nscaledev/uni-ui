<script lang="ts">
	import Icon from '$lib/primitives/Icon.svelte';

	interface Props {
		icon: string;
		disabled?: boolean;
		clicked: () => void;
		[key: string]: any;
	}

	let { icon, disabled = $bindable(), href, clicked, ...props }: Props = $props();
</script>

{#snippet content()}
	<Icon name={icon} size={20} />
{/snippet}

<button class="btn flex gap-2 items-center p-0 {props.class || ''}" {disabled} onclick={clicked}>
	{@render content()}
</button>
