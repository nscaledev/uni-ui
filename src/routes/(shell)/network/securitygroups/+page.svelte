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
	import Badge from '$lib/layouts/Badge.svelte';
	import ModalIcon from '$lib/layouts/ModalIcon.svelte';
	import PopupButton from '$lib/forms/PopupButton.svelte';

	const settings: ShellPageSettings = {
		feature: 'Regions',
		name: 'Security Groups',
		description: 'Manage your network security groups',
		icon: 'mdi:security-network'
	};

	onMount(() => {
		const interval = setInterval(() => navigating.to || invalidate('layout:securitygroups'), 5000);

		return () => clearInterval(interval);
	});

	let createNetworkID = $state(data.networks[0]?.metadata.id);

	function lookupNetwork(id: string): Region.NetworkV2Read {
		return data.networks.find((x) => x.metadata.id == id) as Region.NetworkV2Read;
	}

	function confirm(resource: Region.SecurityGroupV2Read) {
		const parameters: Region.ApiV2OrganizationsOrganizationIDProjectsProjectIDSecuritygroupsSecurityGroupIDDeleteRequest =
			{
				organizationID: resource.metadata.organizationId,
				projectID: resource.metadata.projectId,
				securityGroupID: resource.metadata.id
			};

		Clients.region()
			.apiV2OrganizationsOrganizationIDProjectsProjectIDSecuritygroupsSecurityGroupIDDelete(
				parameters
			)
			.then(() => invalidate('layout:securitygroups'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<ShellPageHeader {settings}>
	{#snippet tools()}
		{#if data.projects.length}
			<PopupButton icon="mdi:add" class="self-end" label="Create">
				{#snippet contents()}
					<div class="flex flex-col gap-4">
						<div class="font-bold">Network</div>

						<div class="input-group grid grid-cols-[auto_1fr]">
							<iconify-icon icon="mdi:network-outline" class="ig-cell"></iconify-icon>

							<select class="ig-select" bind:value={createNetworkID}>
								{#each data.networks as p}
									<option value={p.metadata.id}>{p.metadata.name}</option>
								{/each}
							</select>
						</div>

						<a
							href="/network/securitygroups/create?networkID={createNetworkID}"
							class="btn preset-filled-primary-500">Create</a
						>
					</div>
				{/snippet}
			</PopupButton>
		{/if}
	{/snippet}
</ShellPageHeader>

<ShellList>
	{#each data.securityGroups as resource}
		<ShellListItem>
			{#snippet main()}
				<ShellListItemHeader
					metadata={resource.metadata}
					projects={data.projects}
					href="/network/securitygroups/edit/{resource.metadata.id}"
				/>
			{/snippet}

			{#snippet badges()}
				<ShellListItemBadges metadata={resource.metadata}>
					{#snippet extra()}
						<Badge icon={RegionUtil.icon(data.regions, resource.status.regionId)}>
							{RegionUtil.name(data.regions, resource.status.regionId)}
						</Badge>
						<Badge icon="mdi:network-outline">
							{lookupNetwork(resource.status.networkId).metadata.name}
						</Badge>
					{/snippet}
				</ShellListItemBadges>
			{/snippet}

			{#snippet trail()}
				<ModalIcon
					icon="mdi:trash-can-outline"
					label="Delete"
					title="Are you sure?"
					confirm={() => confirm(resource)}
				></ModalIcon>
			{/snippet}

			<ShellListItemMetadata metadata={resource.metadata} />
		</ShellListItem>
	{/each}
</ShellList>
