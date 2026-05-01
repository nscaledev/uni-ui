<script lang="ts">
	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import PageHeader from '$lib/layouts/PageHeader.svelte';

	interface Props {
		settings: ShellPageSettings;
		tools?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
	}

	let { settings, tools, children }: Props = $props();
</script>

<PageHeader
	breadcrumb={[{ label: settings.feature }, { label: settings.name }]}
	title={settings.name}
	description={settings.description}
>
	{#snippet actions()}
		{@render tools?.()}
		{@render children?.()}
	{/snippet}
</PageHeader>
