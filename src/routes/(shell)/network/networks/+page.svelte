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

	const PROJECT_PALETTE = [
		'oklch(0.65 0.18 220)',
		'oklch(0.65 0.18 290)',
		'oklch(0.68 0.16 30)',
		'oklch(0.65 0.18 340)',
		'oklch(0.65 0.16 170)',
		'oklch(0.68 0.16 80)'
	];

	function networkProject(resource: Region.NetworkV2Read) {
		const idx = data.projects.findIndex((p) => p.metadata.id === resource.metadata.projectId);
		if (idx < 0) return null;
		return {
			name: data.projects[idx].metadata.name,
			color: PROJECT_PALETTE[idx % PROJECT_PALETTE.length]
		};
	}

	function statusKind(resource: Region.NetworkV2Read): string {
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

	function deleteNetwork(resource: Region.NetworkV2Read) {
		Clients.region()
			.apiV2NetworksNetworkIDDelete({ networkID: resource.metadata.id })
			.then(() => invalidate('layout:networks'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<ListPage
	{settings}
	resources={data.networks}
	projects={data.projectID ? [] : data.projects}
	regions={data.regions}
	tableHeaders={['Name', 'Status', 'Project', 'Region', 'Prefix', 'Owner', 'Age', '']}
>
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

	{#snippet tableRow(resource)}
		{@const proj = networkProject(resource)}
		<tr>
			<td class="primary">
				<div>{resource.metadata.name}</div>
				<div class="sub">{resource.metadata.id}</div>
			</td>
			<td>
				<span class="chip chip--{statusKind(resource)}">
					<span class="dot"></span>
					{resource.metadata.provisioningStatus}
				</span>
			</td>
			<td>
				{#if proj}
					<span class="chip">
						<span class="dot" style="background:{proj.color}"></span>
						{proj.name}
					</span>
				{/if}
			</td>
			<td>
				<span class="mono region-cell">
					{RegionUtil.flag(data.regions, resource.status.regionId)}
					{RegionUtil.name(data.regions, resource.status.regionId)}
				</span>
			</td>
			<td><span class="mono">{resource.status.prefix}</span></td>
			<td>{resource.metadata.createdBy}</td>
			<td><span class="mono">{ageFormatter(resource.metadata.creationTime)}</span></td>
			<td class="col-actions">
				<button class="row-action" title="Delete network" onclick={() => deleteNetwork(resource)}>
					<Icon name="trash" size={14} />
				</button>
			</td>
		</tr>
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
