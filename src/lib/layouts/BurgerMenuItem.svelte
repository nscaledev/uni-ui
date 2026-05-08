<script lang="ts">
	import Icon from '$lib/primitives/Icon.svelte';

	interface Props {
		icon: string;
		children?: import('svelte').Snippet;
	}

	let { icon, children }: Props = $props();
</script>

<li>
	<Icon name={icon} size={20} />
	{@render children?.()}
</li>
