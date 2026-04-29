<script lang="ts">
	import * as Identity from '$lib/openapi/identity';
	import * as ProvisioningStatus from '$lib/provisioningStatus';
	import * as HealthStatus from '$lib/healthStatus';
	import * as Kubernetes from '$lib/openapi/kubernetes';

	import Badge from '$lib/layouts/Badge.svelte';

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
		showProvisioning?: boolean;
		showHealth?: boolean;
		extra?: import('svelte').Snippet;
	}

	let { metadata, projects, showProvisioning = true, showHealth = true, extra }: Props = $props();

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

	const provisioningVisible = $derived(
		showProvisioning &&
			!!metadata &&
			metadata.provisioningStatus !== Identity.ResourceProvisioningStatus.Unknown
	);

	const healthVisible = $derived(
		showHealth && !!metadata && metadata.healthStatus !== Identity.ResourceHealthStatus.Unknown
	);
</script>

<div class="badges">
	{#if project}
		<span class="chip">
			<span class="dot" style="background:{project.color}"></span>
			{project.name}
		</span>
	{/if}

	{#if provisioningVisible && metadata}
		<Badge icon={ProvisioningStatus.icon(metadata)} iconcolor={ProvisioningStatus.color(metadata)}>
			{metadata.provisioningStatus}
		</Badge>
	{/if}

	{#if healthVisible && metadata}
		<Badge icon={HealthStatus.icon(metadata)} iconcolor={HealthStatus.color(metadata)}>
			{metadata.healthStatus}
		</Badge>
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
