<script lang="ts">
	import * as Identity from '$lib/openapi/identity';
	import * as ProjectUtil from '$lib/projectutil';
	import { resolveChip, type OperationalStatus } from '$lib/layouts/effectiveStatus';

	interface Props {
		metadata?: Identity.ResourceReadMetadata;
		projects?: Array<Identity.ProjectRead>;
		operationalStatus?: OperationalStatus | null;
		extra?: import('svelte').Snippet;
	}

	let { metadata, projects, operationalStatus, extra }: Props = $props();

	const project = $derived.by(() => {
		if (!metadata || !projects || !('projectId' in metadata)) return null;
		return ProjectUtil.lookup(projects, metadata.projectId as string);
	});

	const chip = $derived(resolveChip(metadata?.provisioningStatus, operationalStatus));
</script>

<div class="badges">
	{#if project}
		<span class="chip chip--name" title={project.name}>
			<span class="dot" style="background:{project.color}"></span>
			<span class="chip-label">{project.name}</span>
		</span>
	{/if}

	{#if chip}
		<span class="chip chip--{chip.chipClass}">
			<span class="dot"></span>
			{chip.label}
		</span>
	{/if}

	{@render extra?.()}
</div>

<style>
	.badges {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		flex: 1 1 0;
		min-width: 0;
	}
</style>
