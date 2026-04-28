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
			<div class="list-item-project">
				<Icon name="folder" size={16} />
				{project}
			</div>
		{/if}

		<div class="list-item-name">
			{#if title}
				{title}
			{:else if metadata}
				{metadata.name}
			{/if}
		</div>

		{#if metadata?.description}
			<div class="list-item-desc">
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

<style>
	:global(.list-item-name) {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-1);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:global(.list-item-project) {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 11.5px;
		color: var(--text-3);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:global(.list-item-desc) {
		font-size: 12px;
		color: var(--text-3);
		font-style: italic;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Make the header a link when href is provided */
	a {
		text-decoration: none;
		color: inherit;
	}

	a:hover :global(.list-item-name) {
		color: var(--accent);
	}
</style>
