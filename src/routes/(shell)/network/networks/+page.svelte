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
	import PopupButton from '$lib/forms/PopupButton.svelte';
	import Icon from '$lib/primitives/Icon.svelte';

	const settings: ShellPageSettings = {
		feature: 'Network',
		name: 'Networks',
		description: 'Manage your networks.',
		icon: 'network'
	};

	onMount(() => startAutoRefresh('layout:networks'));

	// eslint-disable-next-line svelte/valid-compile
	let createProjectID = $state(data.projects[0]?.metadata.id);
	// eslint-disable-next-line svelte/valid-compile
	let createRegionID = $state(data.regions[0]?.metadata.id);

	function deleteNetwork(resource: Region.NetworkV2Read) {
		Clients.region()
			.apiV2NetworksNetworkIDDelete({ networkID: resource.metadata.id })
			.then(() => invalidate('layout:networks'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<ListPage {settings} resources={data.networks} projects={data.projects} regions={data.regions}>
	{#snippet tools()}
		{#if data.projects.length}
			<PopupButton icon="plus" label="Create">
				{#snippet contents()}
					<div class="create-popup">
						<div class="create-popup__label">Project</div>
						<div class="picker">
							<Icon name="folder" size={14} />
							<select bind:value={createProjectID}>
								{#each data.projects as p}
									<option value={p.metadata.id}>{p.metadata.name}</option>
								{/each}
							</select>
						</div>

						<div class="create-popup__label">Region</div>
						<div class="picker">
							<Icon name="globe" size={14} />
							<select bind:value={createRegionID}>
								{#each data.regions as r}
									<option value={r.metadata.id}>{r.metadata.name}</option>
								{/each}
							</select>
						</div>

						<a
							href="/network/networks/create?projectID={createProjectID}&regionID={createRegionID}"
							class="btn btn--primary"
						>
							Continue
						</a>
					</div>
				{/snippet}
			</PopupButton>
		{/if}
	{/snippet}

	{#snippet list(networks)}
		<ShellList>
			{#each networks as resource}
				<ShellListItem>
					{#snippet main()}
						<ShellListItemHeader metadata={resource.metadata} />
					{/snippet}

					{#snippet badges()}
						<ShellListItemBadges metadata={resource.metadata} projects={data.projects}>
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
							title="Delete network?"
							confirm={() => deleteNetwork(resource)}
						/>
					{/snippet}

					<ShellListItemMetadata metadata={resource.metadata} />
					<ShellListItemMetadata>
						<ShellMetadataItem icon="network" label="Prefix" value={resource.status.prefix} />
						<ShellMetadataItem
							icon="dns"
							label="DNS"
							value={resource.spec.dnsNameservers?.join(', ') || 'internal'}
						/>
					</ShellListItemMetadata>
				</ShellListItem>
			{/each}
		</ShellList>
	{/snippet}

	{#snippet empty()}
		<Placeholder>No networks yet — create one to get started.</Placeholder>
	{/snippet}
</ListPage>

<style>
	.create-popup {
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 220px;
	}

	.create-popup__label {
		font-size: 11.5px;
		font-weight: 600;
		color: var(--text-3);
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
</style>
