<script lang="ts">
	import * as Identity from '$lib/openapi/identity';
	import * as Kubernetes from '$lib/openapi/kubernetes';
	import { resolveChip, type OperationalStatus } from '$lib/layouts/effectiveStatus';

	const PROJECT_PALETTE = [
		'oklch(0.65 0.18 220)',
		'oklch(0.65 0.18 290)',
		'oklch(0.68 0.16 30)',
		'oklch(0.65 0.18 340)',
		'oklch(0.65 0.16 170)',
		'oklch(0.68 0.16 80)'
	];

	interface Props {
		metadata?: Identity.ResourceReadMetadata;
		projects?: Array<Identity.ProjectRead>;
		operationalStatus?: OperationalStatus | null;
		extra?: import('svelte').Snippet;
	}

	let { metadata, projects, operationalStatus, extra }: Props = $props();

	const project = $derived.by(() => {
		if (!metadata || !projects || !('projectId' in metadata)) return null;
		const pm = metadata as Kubernetes.ProjectScopedResourceReadMetadata;
		const idx = projects.findIndex((p) => p.metadata.id === pm.projectId);
		if (idx < 0) return null;
		return {
			name: projects[idx].metadata.name,
			color: PROJECT_PALETTE[idx % PROJECT_PALETTE.length]
		};
	});

	const chip = $derived(resolveChip(metadata?.provisioningStatus, operationalStatus));
</script>

<div class="badges">
	{#if project}
		<span class="chip">
			<span class="dot" style="background:{project.color}"></span>
			{project.name}
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
	}
</style>
