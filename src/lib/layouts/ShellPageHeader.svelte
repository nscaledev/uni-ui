<script lang="ts">
	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import Icon from '$lib/primitives/Icon.svelte';

	interface Props {
		settings: ShellPageSettings;
		tools?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
	}

	let { settings, tools, children }: Props = $props();
</script>

<div class="page-head">
	<div>
		<h1>{settings.name}</h1>
		{#if settings.description}
			<div class="sub">{settings.description}</div>
		{/if}
	</div>
	<div class="actions">
		{@render tools?.()}
		{@render children?.()}
	</div>
</div>
