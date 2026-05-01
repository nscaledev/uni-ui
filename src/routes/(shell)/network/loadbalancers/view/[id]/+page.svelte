<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { startAutoRefresh } from '$lib/loadutil';

	let { data }: { data: PageData } = $props();

	import * as Clients from '$lib/clients';
	import * as RegionUtil from '$lib/regionutil';
	import { ageFormatter } from '$lib/formatters';

	import PageHeader from '$lib/layouts/PageHeader.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import ShellMetadataItem from '$lib/layouts/ShellMetadataItem.svelte';
	import ModalIcon from '$lib/layouts/ModalIcon.svelte';
	import LoadBalancerListenerV2 from '$lib/layouts/LoadBalancerListenerV2.svelte';
	import Icon from '$lib/primitives/Icon.svelte';

	onMount(() => startAutoRefresh('layout:loadbalancers'));

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

<PageHeader
	breadcrumb={[
		{ label: 'Load Balancers', href: '/network/loadbalancers' },
		{ label: data.loadBalancer.metadata.name }
	]}
	title={data.loadBalancer.metadata.name}
	description={data.loadBalancer.metadata.description || 'Load balancer details.'}
>
	{#snippet actions()}
		<a href="/network/loadbalancers/edit/{data.loadBalancer.metadata.id}" class="btn btn--ghost">
			<Icon name="edit" size={14} /> Edit
		</a>
		<ModalIcon
			icon="trash"
			label="Delete"
			class="btn btn--danger"
			title="Delete load balancer?"
			confirm={deleteLoadBalancer}
		>
			<p>
				The delete request is asynchronous. You will be returned to the list while the backend
				completes the removal.
			</p>
		</ModalIcon>
	{/snippet}
</PageHeader>

<ShellSection title="Overview">
	<div class="view-badges">
		<span class="chip">{data.loadBalancer.metadata.provisioningStatus}</span>
		<span class="chip">{data.loadBalancer.metadata.healthStatus}</span>
		<span class="chip">
			{RegionUtil.flag(data.regions, data.loadBalancer.status.regionId)}
			{RegionUtil.name(data.regions, data.loadBalancer.status.regionId)}
		</span>
		<span class="chip">{lookupNetworkName()}</span>
	</div>
	<dl class="rcard__grid view-meta">
		<ShellMetadataItem icon="id" label="ID" value={data.loadBalancer.metadata.id} />
		<ShellMetadataItem
			icon="clock"
			label="Age"
			value={ageFormatter(data.loadBalancer.metadata.creationTime)}
		/>
		{#if data.loadBalancer.metadata.createdBy}
			<ShellMetadataItem icon="user" label="Owner" value={data.loadBalancer.metadata.createdBy} />
		{/if}
	</dl>
</ShellSection>

<ShellSection title="Desired State">
	<dl class="rcard__grid">
		<ShellMetadataItem icon="tag" label="Name" value={data.loadBalancer.metadata.name} />
		<ShellMetadataItem
			icon="log"
			label="Description"
			value={data.loadBalancer.metadata.description || 'None'}
		/>
		<ShellMetadataItem icon="tag" label="Tags" value={tagsValue()} />
		<ShellMetadataItem
			icon="globe"
			label="Requested Public IP"
			value={data.loadBalancer.spec.publicIP ? 'Enabled' : 'Disabled'}
		/>
	</dl>

	<div class="listeners">
		<div class="listeners__title">Listeners</div>
		{#each data.loadBalancer.spec.listeners as listener}
			<LoadBalancerListenerV2 {listener} editable={false} />
		{/each}
	</div>
</ShellSection>

<ShellSection title="Observed State">
	<dl class="rcard__grid">
		<ShellMetadataItem
			icon="globe"
			label="Region"
			value="{RegionUtil.flag(data.regions, data.loadBalancer.status.regionId)} {RegionUtil.name(
				data.regions,
				data.loadBalancer.status.regionId
			)}"
		/>
		<ShellMetadataItem icon="network" label="Network" value={lookupNetworkName()} />
		<ShellMetadataItem
			icon="dns"
			label="VIP Address"
			value={data.loadBalancer.status.vipAddress || 'Not yet assigned'}
		/>
		<ShellMetadataItem
			icon="globe"
			label="Public IP"
			value={data.loadBalancer.status.publicIP || 'Not yet assigned'}
		/>
	</dl>
</ShellSection>

<style>
	.view-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 16px;
	}

	.view-meta {
		margin-top: 4px;
	}

	.listeners {
		margin-top: 20px;
	}

	.listeners__title {
		font: 600 13px/1.1 var(--font-sans);
		color: var(--text-1);
		margin-bottom: 12px;
	}

	.listeners > :global(.rcard + .rcard) {
		margin-top: 8px;
	}
</style>
