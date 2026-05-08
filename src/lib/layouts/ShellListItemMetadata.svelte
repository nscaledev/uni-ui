<script lang="ts">
	import type { Snippet } from 'svelte';

	import * as Kubernetes from '$lib/openapi/kubernetes';
	import * as Formatters from '$lib/formatters';

	import ShellMetadataItem from '$lib/layouts/ShellMetadataItem.svelte';

	interface Props {
		metadata?: Kubernetes.ResourceReadMetadata;
		children?: Snippet;
	}

	let { metadata, children }: Props = $props();
</script>

{#if metadata}
	<ShellMetadataItem
		icon="clock"
		label="Age"
		value={Formatters.ageFormatter(metadata.creationTime)}
	/>

	<ShellMetadataItem icon="user" label="Owner" value={metadata.createdBy || 'unknown'} />
{/if}

{@render children?.()}
