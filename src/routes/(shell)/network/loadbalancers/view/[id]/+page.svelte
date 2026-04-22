<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { navigating } from '$app/state';

	let { data }: { data: PageData } = $props();

	import * as Clients from '$lib/clients';
	import * as RegionUtil from '$lib/regionutil';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellViewHeader from '$lib/layouts/ShellViewHeader.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import ShellMetadataItem from '$lib/layouts/ShellMetadataItem.svelte';
	import Badge from '$lib/layouts/Badge.svelte';
	import ModalIcon from '$lib/layouts/ModalIcon.svelte';
	import SubtleButton from '$lib/forms/SubtleButton.svelte';
	import LoadBalancerListenerV2 from '$lib/layouts/LoadBalancerListenerV2.svelte';

	const settings: ShellPageSettings = {
		feature: 'Network',
		name: 'View Load Balancer',
		description: 'Inspect the configured and observed state of a load balancer.',
		icon: 'mdi:router-network-wireless'
	};

	onMount(() => {
		const interval = setInterval(() => navigating.to || invalidate('layout:loadbalancers'), 5000);

		return () => clearInterval(interval);
	});

	function lookupNetworkName(): string {
		return (
			data.networks.find((x) => x.metadata.id == data.loadBalancer.status.networkId)?.metadata
				.name || data.loadBalancer.status.networkId
		);
	}

	function tagsValue(): string {
		return data.loadBalancer.metadata.tags?.length
			? data.loadBalancer.metadata.tags.map((tag) => `${tag.name}=${tag.value}`).join(', ')
			: 'None';
	}

	function deleteLoadBalancer() {
		Clients.region()
			.apiV2LoadbalancersLoadBalancerIDDelete({
				loadBalancerID: data.loadBalancer.metadata.id
			})
			.then(() => window.location.assign('/network/loadbalancers'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<ShellPageHeader {settings}>
	{#snippet tools()}
		<SubtleButton
			icon="mdi:edit-outline"
			label="Edit"
			href="/network/loadbalancers/edit/{data.loadBalancer.metadata.id}"
		/>
		<ModalIcon
			icon="mdi:trash-can-outline"
			label="Delete"
			title="Delete load balancer?"
			confirm={deleteLoadBalancer}
		>
			<p>
				The delete request is asynchronous. You will be returned to the list while the backend
				completes the removal.
			</p>
		</ModalIcon>
	{/snippet}
</ShellPageHeader>

<ShellViewHeader metadata={data.loadBalancer.metadata}>
	{#snippet badges()}
		<Badge icon={RegionUtil.icon(data.regions, data.loadBalancer.status.regionId)}>
			{RegionUtil.name(data.regions, data.loadBalancer.status.regionId)}
		</Badge>
		<Badge icon="mdi:network-outline">{lookupNetworkName()}</Badge>
	{/snippet}
</ShellViewHeader>

<ShellSection title="Desired State">
	<div class="flex flex-col gap-6">
		<div class="grid grid-cols-[repeat(3,max-content)] gap-2 text-sm">
			<ShellMetadataItem
				icon="mdi:label-outline"
				label="Name"
				value={data.loadBalancer.metadata.name}
			/>
			<ShellMetadataItem
				icon="mdi:text-box-outline"
				label="Description"
				value={data.loadBalancer.metadata.description || 'None'}
			/>
			<ShellMetadataItem icon="mdi:tag-multiple-outline" label="Tags" value={tagsValue()} />
			<ShellMetadataItem
				icon="mdi:earth"
				label="Requested Public IP"
				value={data.loadBalancer.spec.publicIP ? 'Enabled' : 'Disabled'}
			/>
		</div>

		<div class="flex flex-col gap-4">
			<div class="h4">Listeners</div>

			{#each data.loadBalancer.spec.listeners as listener}
				<LoadBalancerListenerV2 {listener} editable={false} />
			{/each}
		</div>
	</div>
</ShellSection>

<ShellSection title="Observed State">
	<div class="grid grid-cols-[repeat(3,max-content)] gap-2 text-sm">
		<ShellMetadataItem
			icon={RegionUtil.icon(data.regions, data.loadBalancer.status.regionId)}
			label="Region"
			value={RegionUtil.name(data.regions, data.loadBalancer.status.regionId)}
		/>
		<ShellMetadataItem icon="mdi:network-outline" label="Network" value={lookupNetworkName()} />
		<ShellMetadataItem
			icon="mdi:ip-network-outline"
			label="VIP Address"
			value={data.loadBalancer.status.vipAddress || 'Not yet assigned'}
		/>
		<ShellMetadataItem
			icon="mdi:web"
			label="Public IP"
			value={data.loadBalancer.status.publicIP || 'Not yet assigned'}
		/>
	</div>
</ShellSection>
