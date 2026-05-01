<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { startAutoRefresh } from '$lib/loadutil';

	let { data }: { data: PageData } = $props();

	import * as Clients from '$lib/clients';
	import * as Region from '$lib/openapi/region';
	import * as RegionUtil from '$lib/regionutil';
	import * as Identity from '$lib/openapi/identity';
	import { ageFormatter } from '$lib/formatters';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ListPage from '$lib/layouts/ListPage.svelte';
	import ShellList from '$lib/layouts/ShellList.svelte';
	import ShellListItem from '$lib/layouts/ShellListItem.svelte';
	import ShellListItemHeader from '$lib/layouts/ShellListItemHeader.svelte';
	import ShellListItemBadges from '$lib/layouts/ShellListItemBadges.svelte';
	import ShellListItemMetadata from '$lib/layouts/ShellListItemMetadata.svelte';
	import ShellMetadataItem from '$lib/layouts/ShellMetadataItem.svelte';
	import Badge from '$lib/layouts/Badge.svelte';
	import Placeholder from '$lib/layouts/Placeholder.svelte';
	import ModalIcon from '$lib/layouts/ModalIcon.svelte';
	import RowMenu from '$lib/layouts/RowMenu.svelte';
	import PopupButton from '$lib/forms/PopupButton.svelte';
	import Icon from '$lib/primitives/Icon.svelte';

	const settings: ShellPageSettings = {
		feature: 'Network',
		name: 'Load Balancers',
		description: 'Manage your network load balancers.',
		icon: 'network'
	};

	onMount(() => startAutoRefresh('layout:loadbalancers'));

	// eslint-disable-next-line svelte/valid-compile
	let createNetworkID = $state(data.networks[0]?.metadata.id);

	const createURL = $derived(`/network/loadbalancers/create?networkID=${createNetworkID}`);
	const skipPopup = $derived(data.networks.length === 1);

	function lookupNetworkName(id: string): string {
		return data.networks.find((x) => x.metadata.id === id)?.metadata.name || id;
	}

	function statusKind(resource: Region.LoadBalancerV2Read): string {
		switch (resource.metadata.provisioningStatus) {
			case Identity.ResourceProvisioningStatus.Provisioned:
				return 'ok';
			case Identity.ResourceProvisioningStatus.Error:
				return 'err';
			case Identity.ResourceProvisioningStatus.Deprovisioning:
				return 'warn';
			case Identity.ResourceProvisioningStatus.Unknown:
				return 'muted';
			default:
				return 'info';
		}
	}

	function deleteLoadBalancer(resource: Region.LoadBalancerV2Read) {
		Clients.region()
			.apiV2LoadbalancersLoadBalancerIDDelete({ loadBalancerID: resource.metadata.id })
			.then(() => invalidate('layout:loadbalancers'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<ListPage
	{settings}
	resources={data.loadBalancers}
	regions={data.regions}
	tableHeaders={['Name', 'Status', 'Network', 'Region', 'Listeners', 'VIP', 'Owner', 'Age', '']}
>
	{#snippet tools()}
		{#if data.networks.length}
			{#if skipPopup}
				<a href={createURL} class="btn btn--primary"><Icon name="plus" size={16} /> Create</a>
			{:else}
				<PopupButton icon="plus" label="Create">
					{#snippet contents(close)}
						<div class="create-popup">
							<div class="menu__title" style="padding-inline: 0">Network</div>
							<div class="picker">
								<Icon name="network" size={14} />
								<select bind:value={createNetworkID}>
									{#each data.networks as network}
										<option value={network.metadata.id}>{network.metadata.name}</option>
									{/each}
								</select>
							</div>
							<div class="create-popup__footer">
								<button onclick={close} class="btn btn--ghost btn--sm">Cancel</button>
								<a href={createURL} class="btn btn--primary btn--sm">Continue</a>
							</div>
						</div>
					{/snippet}
				</PopupButton>
			{/if}
		{/if}
	{/snippet}

	{#snippet tableRow(resource)}
		<td class="primary">
			<a href="/network/loadbalancers/view/{resource.metadata.id}">{resource.metadata.name}</a>
			<div class="sub">{resource.metadata.id}</div>
		</td>
		<td>
			<span class="chip chip--{statusKind(resource)}">
				<span class="dot"></span>
				{resource.metadata.provisioningStatus}
			</span>
		</td>
		<td>{lookupNetworkName(resource.status.networkId)}</td>
		<td>
			<span class="mono region-cell">
				{RegionUtil.flag(data.regions, resource.status.regionId)}
				{RegionUtil.name(data.regions, resource.status.regionId)}
			</span>
		</td>
		<td>{resource.spec.listeners.length}</td>
		<td><span class="mono">{resource.status.vipAddress || '—'}</span></td>
		<td>{resource.metadata.createdBy}</td>
		<td><span class="mono">{ageFormatter(resource.metadata.creationTime)}</span></td>
		<RowMenu>
			{#snippet menu()}
				<a href="/network/loadbalancers/view/{resource.metadata.id}" class="menu__item">
					<Icon name="eye" size={14} /> View
				</a>
				<a href="/network/loadbalancers/edit/{resource.metadata.id}" class="menu__item">
					<Icon name="edit" size={14} /> Edit
				</a>
				<ModalIcon
					icon="trash"
					label="Delete"
					class="menu__item menu__item--danger"
					title="Delete load balancer?"
					confirm={() => deleteLoadBalancer(resource)}
				>
					The load balancer may remain visible until the backend finishes removing it.
				</ModalIcon>
			{/snippet}
		</RowMenu>
	{/snippet}

	{#snippet list(loadBalancers)}
		<ShellList>
			{#each loadBalancers as resource}
				<ShellListItem id={resource.metadata.id}>
					{#snippet main()}
						<ShellListItemHeader
							metadata={resource.metadata}
							href="/network/loadbalancers/view/{resource.metadata.id}"
						/>
					{/snippet}

					{#snippet badges()}
						<ShellListItemBadges metadata={resource.metadata}>
							{#snippet extra()}
								<Badge>
									{RegionUtil.flag(data.regions, resource.status.regionId)}
									{RegionUtil.name(data.regions, resource.status.regionId)}
								</Badge>
								<Badge icon="network">{lookupNetworkName(resource.status.networkId)}</Badge>
								<Badge icon="link">{resource.spec.listeners.length} listeners</Badge>
							{/snippet}
						</ShellListItemBadges>
					{/snippet}

					{#snippet menu()}
						<a href="/network/loadbalancers/view/{resource.metadata.id}" class="menu__item">
							<Icon name="eye" size={14} /> View
						</a>
						<a href="/network/loadbalancers/edit/{resource.metadata.id}" class="menu__item">
							<Icon name="edit" size={14} /> Edit
						</a>
						<ModalIcon
							icon="trash"
							label="Delete"
							class="menu__item menu__item--danger"
							title="Delete load balancer?"
							confirm={() => deleteLoadBalancer(resource)}
						>
							The load balancer may remain visible until the backend finishes removing it.
						</ModalIcon>
					{/snippet}

					<ShellListItemMetadata metadata={resource.metadata} />
					<ShellListItemMetadata>
						<ShellMetadataItem
							icon="network"
							label="VIP"
							value={resource.status.vipAddress || 'Not yet assigned'}
						/>
						<ShellMetadataItem
							icon="globe"
							label="Public IP"
							value={resource.status.publicIP || 'Not yet assigned'}
						/>
					</ShellListItemMetadata>
				</ShellListItem>
			{/each}
		</ShellList>
	{/snippet}

	{#snippet empty()}
		<Placeholder>No load balancers yet — create one to get started.</Placeholder>
	{/snippet}
</ListPage>
