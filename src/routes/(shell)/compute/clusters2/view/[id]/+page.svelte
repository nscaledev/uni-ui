<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { navigating } from '$app/state';

	let { data }: { data: PageData } = $props();

	import * as RegionUtil from '$lib/regionutil';
	import * as Clients from '$lib/clients';
	import * as Compute from '$lib/openapi/compute';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellViewHeader from '$lib/layouts/ShellViewHeader.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import Badge from '$lib/layouts/Badge.svelte';
	import ModalIcon from '$lib/layouts/ModalIcon.svelte';
	import SubtleButton from '$lib/forms/SubtleButton.svelte';

	const settings: ShellPageSettings = {
		feature: 'Infrastructure',
		name: 'View Compute Cluster',
		description: 'Shows details of a compute cluster.',
		icon: 'mdi:server-network-outline'
	};

	onMount(() => {
		const interval = setInterval(() => navigating.to || invalidate('layout:clusters2'), 5000);

		return () => clearInterval(interval);
	});

	function deleteCluster(resource: Compute.ClusterV2Read): void {
		const parameters = {
			clusterID: resource.metadata.id
		};

		Clients.compute()
			.apiV2ClustersClusterIDDelete(parameters)
			.then(() => window.location.assign('/compute/clusters2'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<ShellPageHeader {settings}>
	{#snippet tools()}
		<SubtleButton
			icon="mdi:edit-outline"
			label="Edit"
			href="/compute/clusters2/edit/{data.cluster.metadata.id}"
		/>
		<ModalIcon
			icon="mdi:trash-can-outline"
			label="Delete"
			title="Are you sure?"
			confirm={() => deleteCluster(data.cluster)}
		></ModalIcon>
	{/snippet}
</ShellPageHeader>

<ShellViewHeader metadata={data.cluster.metadata}>
	{#snippet badges()}
		<Badge icon={RegionUtil.icon(data.regions, data.cluster.status.regionId)}>
			{RegionUtil.name(data.regions, data.cluster.status.regionId)}
		</Badge>
	{/snippet}
</ShellViewHeader>

<ShellSection title="Instances"></ShellSection>
