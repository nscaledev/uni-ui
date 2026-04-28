<script lang="ts">
	import Icon from '$lib/primitives/Icon.svelte';

	interface Props {
		children: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="flex flex-col items-center gap-4">
	<Icon name="info" size={48} />
	<div class="font-bold">
		{@render children()}
	</div>
</div>
