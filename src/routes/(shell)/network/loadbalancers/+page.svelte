<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { navigating } from '$app/state';

	let { data }: { data: PageData } = $props();

	import * as Clients from '$lib/clients';
	import * as Region from '$lib/openapi/region';
	import * as RegionUtil from '$lib/regionutil';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellList from '$lib/layouts/ShellList.svelte';
	import ShellListItem from '$lib/layouts/ShellListItem.svelte';
	import ShellListItemHeader from '$lib/layouts/ShellListItemHeader.svelte';
	import ShellListItemBadges from '$lib/layouts/ShellListItemBadges.svelte';
	import ShellListItemMetadata from '$lib/layouts/ShellListItemMetadata.svelte';
	import ShellMetadataItem from '$lib/layouts/ShellMetadataItem.svelte';
	import Badge from '$lib/layouts/Badge.svelte';
	import ModalIcon from '$lib/layouts/ModalIcon.svelte';
	import PopupButton from '$lib/forms/PopupButton.svelte';

	const settings: ShellPageSettings = {
		feature: 'Network',
		name: 'Load Balancers',
		description: 'Manage your network load balancers',
		icon: 'mdi:router-network-wireless'
	};

	onMount(() => {
		const interval = setInterval(() => navigating.to || invalidate('layout:loadbalancers'), 5000);

		return () => clearInterval(interval);
	});

	function initialCreateNetworkID(): string | undefined {
		return data.networks[0]?.metadata.id;
	}

	let createNetworkID = $state(initialCreateNetworkID());

	function lookupNetwork(id: string): Region.NetworkV2Read | undefined {
		return data.networks.find((x) => x.metadata.id == id);
	}

	function lookupNetworkName(id: string): string {
		return lookupNetwork(id)?.metadata.name || id;
	}

	function confirm(resource: Region.LoadBalancerV2Read) {
		const parameters: Region.ApiV2LoadbalancersLoadBalancerIDDeleteRequest = {
			loadBalancerID: resource.metadata.id
		};

		Clients.region()
			.apiV2LoadbalancersLoadBalancerIDDelete(parameters)
			.then(() => invalidate('layout:loadbalancers'))
			.catch((e: Error) => Clients.error(e));
	}

	function requestedPublicIP(resource: Region.LoadBalancerV2Read): string {
		return resource.spec.publicIP ? 'Enabled' : 'Disabled';
	}
</script>

<ShellPageHeader {settings}>
	{#snippet tools()}
		{#if data.networks.length}
			<PopupButton icon="mdi:add" class="self-end" label="Create">
				{#snippet contents()}
					<div class="flex flex-col gap-4">
						<div class="font-bold">Network</div>

						<div class="input-group grid grid-cols-[auto_1fr]">
							<iconify-icon icon="mdi:network-outline" class="ig-cell"></iconify-icon>

							<select class="ig-select" bind:value={createNetworkID}>
								{#each data.networks as network}
									<option value={network.metadata.id}>{network.metadata.name}</option>
								{/each}
							</select>
						</div>

						<a
							href="/network/loadbalancers/create?networkID={createNetworkID}"
							class="btn preset-filled-primary-500">Create</a
						>
					</div>
				{/snippet}
			</PopupButton>
		{/if}
	{/snippet}
</ShellPageHeader>

<ShellList>
	{#each data.loadBalancers as resource}
		<ShellListItem>
			{#snippet main()}
				<ShellListItemHeader
					metadata={resource.metadata}
					href="/network/loadbalancers/view/{resource.metadata.id}"
				/>
			{/snippet}

			{#snippet badges()}
				<ShellListItemBadges metadata={resource.metadata}>
					{#snippet extra()}
						<Badge icon={RegionUtil.flag(data.regions, resource.status.regionId)}>
							{RegionUtil.name(data.regions, resource.status.regionId)}
						</Badge>
						<Badge icon="mdi:network-outline">
							{lookupNetworkName(resource.status.networkId)}
						</Badge>
						<Badge icon="mdi:transit-connection-variant">
							{resource.spec.listeners.length} listeners
						</Badge>
					{/snippet}
				</ShellListItemBadges>
			{/snippet}

			{#snippet menu()}
				<ModalIcon
					icon="mdi:trash-can-outline"
					label="Delete"
					title="Delete load balancer?"
					confirm={() => confirm(resource)}
				>
					<p>
						The delete request is asynchronous. The load balancer may remain visible until the
						backend finishes removing it.
					</p>
				</ModalIcon>
			{/snippet}

			<ShellListItemMetadata metadata={resource.metadata} />

			<ShellListItemMetadata>
				<ShellMetadataItem
					icon="mdi:earth"
					label="Requested Public IP"
					value={requestedPublicIP(resource)}
				/>
				<ShellMetadataItem
					icon="mdi:ip-network-outline"
					label="VIP Address"
					value={resource.status.vipAddress || 'Not yet assigned'}
				/>
				<ShellMetadataItem
					icon="mdi:web"
					label="Public IP"
					value={resource.status.publicIP || 'Not yet assigned'}
				/>
			</ShellListItemMetadata>
		</ShellListItem>
	{/each}
</ShellList>
