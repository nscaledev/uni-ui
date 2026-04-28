<script lang="ts">
	import * as Identity from '$lib/openapi/identity';
	import Icon from '$lib/primitives/Icon.svelte';
	import * as Kubernetes from '$lib/openapi/kubernetes';

	interface Props {
		// This is the simple interface for non-unikorn reosurces.
		title?: string;
		// This is the interface for unikorn resources.
		metadata?: Kubernetes.ResourceReadMetadata;
		projects?: Array<Identity.ProjectRead>;
		// This causes the header to bcome a hyperlink.
		href?: string;
	}

	let { title, metadata, projects, href }: Props = $props();

	let project = $derived.by(() => {
		if (!metadata || !projects || !('projectId' in metadata)) return;

		const projectMetadata = metadata as Kubernetes.ProjectScopedResourceReadMetadata;

		const temp = projects.find(
			(x: Identity.ProjectRead) => x.metadata.id == projectMetadata.projectId
		);

		if (!temp) return projectMetadata.projectId;

		return temp.metadata.name;
	});
</script>

{#snippet header()}
	<header class="flex flex-col gap-1">
		{#if project}
			<div class="flex gap-2 items-center tex-sm overflow-hidden text-ellipsis whitespace-nowrap">
				<Icon name="folder" size={16} />
				{project}
			</div>
		{/if}

		<div class="h5 font-bold overflow-hidden text-ellipsis whitespace-nowrap">
			{#if title}
				{title}
			{:else if metadata}
				{metadata.name}
			{/if}
		</div>

		{#if metadata?.description}
			<div class="text-sm italic text-surface-700-300 whitespace-nowrap">
				{metadata.description}
			</div>
		{/if}
	</header>
{/snippet}

{#if href}
	<a {href}>
		{@render header()}
	</a>
{:else}
	{@render header()}
{/if}
