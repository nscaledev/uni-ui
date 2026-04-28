<script lang="ts">
	import * as Identity from '$lib/openapi/identity';
	import * as ProvisioningStatus from '$lib/provisioningStatus';
	import * as HealthStatus from '$lib/healthStatus';

	import Badge from '$lib/layouts/Badge.svelte';

	interface Props {
		metadata?: Identity.ResourceReadMetadata;
		// Set false to suppress a badge type entirely regardless of the data.
		showProvisioning?: boolean;
		showHealth?: boolean;
		extra?: import('svelte').Snippet;
	}

	let { metadata, showProvisioning = true, showHealth = true, extra }: Props = $props();

	// Auto-suppress badges whose value is 'unknown' — the API doesn't implement
	// that status concept for this resource type, so showing it adds no signal.
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
