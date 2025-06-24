<script lang="ts">
	import * as Identity from '$lib/openapi/identity';
	import * as Formatters from '$lib/formatters';
	import * as ProvisioningStatus from '$lib/provisioningStatus';
	import * as HealthStatus from '$lib/healthStatus';
	import Badge from '$lib/layouts/Badge.svelte';
	import ShellMetadataItem from '$lib/layouts/ShellMetadataItem.svelte';

	import type { Snippet } from 'svelte';

	interface Props {
		metadata: Identity.ResourceReadMetadata;
		badges?: import('svelte').Snippet;
		extraMetadata?: Snippet;
	}

	let { metadata, badges, extraMetadata }: Props = $props();
</script>

<div class="flex flex-col gap-8">
	<div class="flex gap-2 items-center flex-wrap">
		<Badge icon={ProvisioningStatus.icon(metadata)} iconcolor={ProvisioningStatus.color(metadata)}>
			{metadata.provisioningStatus}
		</Badge>
		<Badge icon={HealthStatus.icon(metadata)} iconcolor={HealthStatus.color(metadata)}>
			{metadata.healthStatus}
		</Badge>

		{@render badges?.()}
	</div>

	<div class="flex flex-col gap-1">
		<h2 class="h2">{metadata.name}</h2>

		{#if metadata.description}
			<div class="text-sm italic">{metadata.description}</div>
		{/if}
	</div>

	<div class="grid grid-cols-[repeat(3,max-content)] gap-2 text-sm">
		<ShellMetadataItem icon="mdi:identifier" label="ID" value={metadata.id} />
		<ShellMetadataItem
			icon="mdi:clock-time-five-outline"
			label="Age"
			value={Formatters.ageFormatter(metadata.creationTime)}
		/>

		{#if metadata.createdBy}
			<ShellMetadataItem icon="mdi:user-outline" label="Owner" value={metadata.createdBy} />
		{/if}

		{@render extraMetadata?.()}
	</div>
</div>
