<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { startAutoRefresh } from '$lib/loadutil';
	let { data }: { data: PageData } = $props();
	import * as Clients from '$lib/clients';
	import * as Region from '$lib/openapi/region';
	import * as RegionUtil from '$lib/regionutil';
	import { resolveChip } from '$lib/layouts/effectiveStatus';
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
	import PopupButton from '$lib/forms/PopupButton.svelte';
	import ModalIcon from '$lib/layouts/ModalIcon.svelte';
	import RowMenu from '$lib/layouts/RowMenu.svelte';
	import Icon from '$lib/primitives/Icon.svelte';
	const settings: ShellPageSettings = {
		feature: 'Network',
		name: 'Security Groups',
		description: 'Manage network security groups.',
		icon: 'security'
	};
	onMount(() => startAutoRefresh('layout:securitygroups'));
	// eslint-disable-next-line svelte/valid-compile
	let createNetworkID = $state(data.networks[0]?.metadata.id);
	const PROJECT_PALETTE = [
		'oklch(0.65 0.18 220)',
		'oklch(0.65 0.18 290)',
		'oklch(0.68 0.16 30)',
		'oklch(0.65 0.18 340)',
		'oklch(0.65 0.16 170)',
		'oklch(0.68 0.16 80)'
	];

	function lookupNetwork(id: string): Region.NetworkV2Read {
		return data.networks.find((x) => x.metadata.id == id) as Region.NetworkV2Read;
	}

	function securityGroupProject(resource: Region.SecurityGroupV2Read) {
		const idx = data.projects.findIndex((p) => p.metadata.id === resource.metadata.projectId);
		if (idx < 0) return null;
		return {
			name: data.projects[idx].metadata.name,
			color: PROJECT_PALETTE[idx % PROJECT_PALETTE.length]
		};
	}
	function deleteGroup(resource: Region.SecurityGroupV2Read) {
		Clients.region()
			.apiV2SecuritygroupsSecurityGroupIDDelete({ securityGroupID: resource.metadata.id })
			.then(() => invalidate('layout:securitygroups'))
			.catch((e: Error) => Clients.error(e));
	}

	async function bulkDeleteSecurityGroups(ids: Set<string>, clear: () => void) {
		await Promise.allSettled(
			[...ids].map((id) =>
				Clients.region().apiV2SecuritygroupsSecurityGroupIDDelete({ securityGroupID: id })
			)
		);
		clear();
		invalidate('layout:securitygroups');
	}
</script>

<ListPage
	{settings}
	resources={data.securityGroups}
	projects={data.projectID ? [] : data.projects}
	regions={data.regions}
	tableHeaders={['Name', 'Status', 'Project', 'Region', 'Network', 'Owner', 'Age', '']}
>
	{#snippet bulkbar({ ids, clear })}
		<ModalIcon
			icon="trash"
			label="Delete ({ids.size})"
			class="btn btn--sm btn--danger"
			title="Delete {ids.size} security group{ids.size === 1 ? '' : 's'}?"
			confirm={() => bulkDeleteSecurityGroups(ids, clear)}
		>
			This will permanently remove {ids.size} security group{ids.size === 1 ? '' : 's'}.
		</ModalIcon>
	{/snippet}

	{#snippet tableRow(resource)}
		{@const chip = resolveChip(resource.metadata.provisioningStatus, null)}
		{@const proj = securityGroupProject(resource)}
		<td class="primary">
			<a href="/network/securitygroups/edit/{resource.metadata.id}">
				<div>{resource.metadata.name}</div>
				<div class="sub">{resource.metadata.id}</div>
			</a>
		</td>
		<td>
			{#if chip}<span class="chip chip--{chip.chipClass}"
					><span class="dot"></span>{chip.label}</span
				>{/if}
		</td>
		<td>
			{#if proj}<span class="chip"
					><span class="dot" style="background:{proj.color}"></span>{proj.name}</span
				>{/if}
		</td>
		<td>
			<span class="mono region-cell">
				{RegionUtil.flag(data.regions, resource.status.regionId)}
				{RegionUtil.name(data.regions, resource.status.regionId)}
			</span>
		</td>
		<td>{lookupNetwork(resource.status.networkId)?.metadata.name ?? '—'}</td>
		<td>{resource.metadata.createdBy}</td>
		<td><span class="mono">{ageFormatter(resource.metadata.creationTime)}</span></td>
		<RowMenu>
			{#snippet menu()}
				<ModalIcon
					icon="trash"
					label="Delete"
					class="menu__item menu__item--danger"
					title="Delete security group?"
					confirm={() => deleteGroup(resource)}
				>
					Removing "{resource.metadata.name}" will affect any instances using it.
				</ModalIcon>
			{/snippet}
		</RowMenu>
	{/snippet}

	{#snippet tools()}
		{#if data.projects.length}
			<PopupButton icon="plus" label="Create">
				{#snippet contents()}
					<div class="create-popup">
						<div class="create-popup__label">Network</div>
						<div class="picker">
							<Icon name="network" size={14} /><select bind:value={createNetworkID}
								>{#each data.networks as n}<option value={n.metadata.id}>{n.metadata.name}</option
									>{/each}</select
							>
						</div>
						<a
							href="/network/securitygroups/create?networkID={createNetworkID}"
							class="btn btn--primary">Continue</a
						>
					</div>
				{/snippet}
			</PopupButton>
		{/if}
	{/snippet}
	{#snippet list(groups)}<ShellList
			>{#each groups as resource}<ShellListItem id={resource.metadata.id}>
					{#snippet main()}<ShellListItemHeader
							metadata={resource.metadata}
							href="/network/securitygroups/edit/{resource.metadata.id}"
						/>{/snippet}
					{#snippet badges()}
						<ShellListItemBadges metadata={resource.metadata} projects={data.projects}>
							{#snippet extra()}<Badge
									>{RegionUtil.flag(data.regions, resource.status.regionId)}
									{RegionUtil.name(data.regions, resource.status.regionId)}</Badge
								>{/snippet}
						</ShellListItemBadges>
					{/snippet}
					{#snippet menu()}
						<ModalIcon
							icon="trash"
							label="Delete"
							class="menu__item menu__item--danger"
							title="Delete security group?"
							confirm={() => deleteGroup(resource)}
						>
							Removing "{resource.metadata.name}" will affect any instances using it.
						</ModalIcon>
					{/snippet}
					<ShellListItemMetadata metadata={resource.metadata}>
						<ShellMetadataItem
							icon="network"
							label="Network"
							value={lookupNetwork(resource.status.networkId).metadata.name}
						/>
					</ShellListItemMetadata>
				</ShellListItem>{/each}</ShellList
		>{/snippet}
	{#snippet empty()}<Placeholder>No security groups yet — create one to get started.</Placeholder
		>{/snippet}
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
