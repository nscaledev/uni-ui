<script lang="ts">
	import type { PageData } from './$types';
	import { invalidate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { startAutoRefresh } from '$lib/loadutil';
	import * as Clients from '$lib/clients';
	import * as Region from '$lib/openapi/region';
	import * as RegionUtil from '$lib/regionutil';
	import * as ProjectUtil from '$lib/projectutil';
	import { ageFormatter } from '$lib/formatters';
	import { resolveChip } from '$lib/layouts/effectiveStatus';
	import type { ShellPageSettings } from '$lib/layouts/types';
	import ListPage from '$lib/layouts/ListPage.svelte';
	import ShellList from '$lib/layouts/ShellList.svelte';
	import ShellListItem from '$lib/layouts/ShellListItem.svelte';
	import ShellListItemHeader from '$lib/layouts/ShellListItemHeader.svelte';
	import ShellListItemBadges from '$lib/layouts/ShellListItemBadges.svelte';
	import ShellListItemMetadata from '$lib/layouts/ShellListItemMetadata.svelte';
	import ShellMetadataItem from '$lib/layouts/ShellMetadataItem.svelte';
	import Placeholder from '$lib/layouts/Placeholder.svelte';
	import ModalIcon from '$lib/layouts/ModalIcon.svelte';
	import RowMenu from '$lib/layouts/RowMenu.svelte';
	import Icon from '$lib/primitives/Icon.svelte';

	let { data }: { data: PageData } = $props();
	const settings: ShellPageSettings = {
		feature: 'Storage',
		name: 'Volumes',
		description: 'Manage your block storage volumes.',
		icon: 'layers'
	};

	onMount(() => startAutoRefresh('layout:volumes'));
	const hasCompatibleVolumeClass = $derived(
		data.networks.some((network) =>
			data.volumeClasses.some(
				(volumeClass) => volumeClass.spec.regionId === network.status.regionId
			)
		)
	);
	function networkName(id: string): string {
		return data.networks.find((network) => network.metadata.id === id)?.metadata.name ?? id;
	}

	function volumeClassName(id: string): string {
		return data.volumeClasses.find((item) => item.metadata.id === id)?.metadata.name ?? id;
	}

	function deleteVolume(resource: Region.VolumeV2Read) {
		Clients.region()
			.apiV2VolumesVolumeIDDelete({ volumeID: resource.metadata.id })
			.then(() => invalidate('layout:volumes'))
			.catch((error: Error) => Clients.error(error));
	}

	async function bulkDeleteVolumes(ids: Set<string>, clear: () => void) {
		const results = await Promise.allSettled(
			[...ids].map((id) => Clients.region().apiV2VolumesVolumeIDDelete({ volumeID: id }))
		);
		const rejected = results.find((result) => result.status === 'rejected');
		if (rejected) await Clients.error(rejected.reason as Error);
		clear();
		invalidate('layout:volumes');
	}
</script>

<ListPage
	{settings}
	resources={data.volumes}
	projects={data.projectID ? [] : data.projects}
	regions={data.regions}
	tableHeaders={[
		'Name',
		'Status',
		'Project',
		'Region',
		'Network',
		'Volume class',
		'Size',
		'Attached',
		'Age',
		''
	]}
>
	{#snippet bulkbar({ ids, clear })}
		<ModalIcon
			icon="trash"
			label="Delete ({ids.size})"
			class="btn btn--sm btn--danger"
			title="Delete {ids.size} volume{ids.size === 1 ? '' : 's'}?"
			confirm={() => bulkDeleteVolumes(ids, clear)}
		>
			This will permanently remove {ids.size} volume{ids.size === 1 ? '' : 's'} and its data.
		</ModalIcon>
	{/snippet}

	{#snippet tools()}
		{#if hasCompatibleVolumeClass}
			<a href={resolve('/storage/volumes/create')} class="btn btn--primary"
				><Icon name="plus" size={16} /> Create</a
			>
		{:else}<button class="btn btn--primary" disabled><Icon name="plus" size={16} /> Create</button
			>{/if}
	{/snippet}

	{#snippet tableRow(resource)}
		{@const project = ProjectUtil.lookup(data.projects, resource.metadata.projectId)}
		{@const status = resolveChip(resource.metadata.provisioningStatus, null)}
		<td class="primary"
			><span>{resource.metadata.name}</span>
			<div class="sub">{resource.metadata.id}</div></td
		>
		<td>
			{#if status}
				<span class="chip chip--{status.chipClass}">
					<span class="dot"></span>{status.label}
				</span>
			{/if}
		</td>
		<td>
			{#if project}
				<span class="chip chip--name" title={project.name}>
					<span class="dot" style="background:{project.color}"></span>
					<span class="chip-label">{project.name}</span>
				</span>
			{:else}
				{resource.metadata.projectId}
			{/if}
		</td>
		<td
			><span class="mono region-cell"
				>{RegionUtil.flag(data.regions, resource.status.regionId)}
				{RegionUtil.name(data.regions, resource.status.regionId)}</span
			></td
		>
		<td>{networkName(resource.spec.networkId)}</td>
		<td>{volumeClassName(resource.spec.volumeClassId)}</td>
		<td>{resource.status.sizeGiB ?? resource.spec.sizeGiB} GiB</td>
		<td
			><span class="chip chip--{resource.status.attachedAt ? 'ok' : 'muted'}"
				><span class="dot"></span>{resource.status.attachedAt ? 'Yes' : 'No'}</span
			></td
		>
		<td><span class="mono">{ageFormatter(resource.metadata.creationTime)}</span></td>
		<RowMenu
			>{#snippet menu()}<ModalIcon
					icon="trash"
					label="Delete"
					class="menu__item menu__item--danger"
					title="Delete volume?"
					confirm={() => deleteVolume(resource)}
					>This will permanently remove the volume and its data.</ModalIcon
				>{/snippet}</RowMenu
		>
	{/snippet}

	{#snippet list(volumes)}
		<ShellList>
			{#each volumes as resource (resource.metadata.id)}
				<ShellListItem id={resource.metadata.id}>
					{#snippet main()}
						<span class="mono region-cell">
							{RegionUtil.flag(data.regions, resource.status.regionId)}
							{RegionUtil.name(data.regions, resource.status.regionId)}
						</span>
						<ShellListItemHeader metadata={resource.metadata} />
					{/snippet}
					{#snippet badges()}
						<ShellListItemBadges metadata={resource.metadata} projects={data.projects} />
					{/snippet}
					{#snippet menu()}<ModalIcon
							icon="trash"
							label="Delete"
							class="menu__item menu__item--danger"
							title="Delete volume?"
							confirm={() => deleteVolume(resource)}
							>This will permanently remove the volume and its data.</ModalIcon
						>{/snippet}
					<ShellListItemMetadata metadata={resource.metadata} />
					<ShellListItemMetadata>
						<ShellMetadataItem
							icon="network"
							label="Network"
							value={networkName(resource.spec.networkId)}
						/>
						<ShellMetadataItem
							icon="cards"
							label="Volume class"
							value={volumeClassName(resource.spec.volumeClassId)}
						/>
						<ShellMetadataItem
							icon="layers"
							label="Size"
							value={`${resource.status.sizeGiB ?? resource.spec.sizeGiB} GiB`}
						/>
					</ShellListItemMetadata>
				</ShellListItem>
			{/each}
		</ShellList>
	{/snippet}

	{#snippet empty()}
		{#if !data.networks.length}
			<Placeholder>No networks exist yet — create a network before creating a volume.</Placeholder>
		{:else if !hasCompatibleVolumeClass}
			<Placeholder>No compatible volume classes are available.</Placeholder>
		{:else}
			<Placeholder>No volumes yet — create one to get started.</Placeholder>
		{/if}
	{/snippet}
</ListPage>
