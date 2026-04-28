<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { startAutoRefresh } from '$lib/loadutil';

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
	import Icon from '$lib/primitives/Icon.svelte';

	const settings: ShellPageSettings = {
		feature: 'Regions',
		name: 'Networks',
		description: 'Manage your networks',
		icon: 'network'
	};

	onMount(() => startAutoRefresh('layout:networks'));

	function initialCreateProjectID(): string | undefined {
		return data.projects[0]?.metadata.id;
	}

	function initialCreateRegionID(): string | undefined {
		return data.regions[0]?.metadata.id;
	}

	let createProjectID = $state(initialCreateProjectID());
	let createRegionID = $state(initialCreateRegionID());

	function confirm(resource: Region.NetworkV2Read) {
		const parameters = {
			networkID: resource.metadata.id
		};

		Clients.region()
			.apiV2NetworksNetworkIDDelete(parameters)
			.then(() => invalidate('layout:networks'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<ShellPageHeader {settings}>
	{#snippet tools()}
		{#if data.projects.length}
			<PopupButton icon="plus" class="self-end" label="Create">
				{#snippet contents()}
					<div class="flex flex-col gap-4">
						<div class="font-bold">Project</div>

						<div class="input-group grid grid-cols-[auto_1fr]">
							<Icon name="folder" size={20} class="ig-cell" />

							<select class="ig-select" bind:value={createProjectID}>
								{#each data.projects as p}
									<option value={p.metadata.id}>{p.metadata.name}</option>
								{/each}
							</select>
						</div>

						<div class="font-bold">Region</div>

						<div class="input-group grid grid-cols-[auto_1fr]">
							<Icon name="" size={20} class="ig-cell" />

							<select class="ig-select" bind:value={createRegionID}>
								{#each data.regions as r}
									<option value={r.metadata.id}>{r.metadata.name}</option>
								{/each}
							</select>
						</div>

						<a
							href="/network/networks/create?projectID={createProjectID}&regionID={createRegionID}"
							class="btn preset-filled-primary-500">Create</a
						>
					</div>
				{/snippet}
			</PopupButton>
		{/if}
	{/snippet}
</ShellPageHeader>

<ShellList>
	{#each data.networks as resource}
		<ShellListItem>
			{#snippet main()}
				<ShellListItemHeader metadata={resource.metadata} projects={data.projects} />
			{/snippet}

			{#snippet badges()}
				<ShellListItemBadges metadata={resource.metadata}>
					{#snippet extra()}
						<Badge>
							{RegionUtil.flag(data.regions, resource.status.regionId)}
							{RegionUtil.name(data.regions, resource.status.regionId)}
						</Badge>
					{/snippet}
				</ShellListItemBadges>
			{/snippet}

			{#snippet trail()}
				<ModalIcon
					icon="trash"
					label="Delete"
					title="Are you sure?"
					confirm={() => confirm(resource)}
				></ModalIcon>
			{/snippet}

			<ShellListItemMetadata metadata={resource.metadata} />

			<ShellListItemMetadata>
				<ShellMetadataItem icon="network" label="Prefix" value={resource.status.prefix} />
				<ShellMetadataItem
					icon="dns"
					label="DNS Nameservers"
					value={resource.spec.dnsNameservers?.join(', ') || 'internal'}
				/>
			</ShellListItemMetadata>
		</ShellListItem>
	{/each}
</ShellList>
