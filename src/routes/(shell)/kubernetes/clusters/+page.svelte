<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { startAutoRefresh } from '$lib/loadutil';
	let { data }: { data: PageData } = $props();
	import * as Clients from '$lib/clients';
	import * as Kubernetes from '$lib/openapi/kubernetes';
	import { resolveChip, fromHealthStatus } from '$lib/layouts/effectiveStatus';
	import { ageFormatter } from '$lib/formatters';
	import * as RegionUtil from '$lib/regionutil';
	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ListPage from '$lib/layouts/ListPage.svelte';
	import ShellList from '$lib/layouts/ShellList.svelte';
	import ShellListItem from '$lib/layouts/ShellListItem.svelte';
	import ShellListItemHeader from '$lib/layouts/ShellListItemHeader.svelte';
	import ShellListItemBadges from '$lib/layouts/ShellListItemBadges.svelte';
	import ShellListItemMetadata from '$lib/layouts/ShellListItemMetadata.svelte';
	import Badge from '$lib/layouts/Badge.svelte';
	import Placeholder from '$lib/layouts/Placeholder.svelte';
	import PopupButton from '$lib/forms/PopupButton.svelte';
	import ModalIcon from '$lib/layouts/ModalIcon.svelte';
	import RowMenu from '$lib/layouts/RowMenu.svelte';
	import Icon from '$lib/primitives/Icon.svelte';
	const settings: ShellPageSettings = {
		feature: 'Kubernetes',
		name: 'Clusters',
		description: 'Managed Kubernetes clusters.',
		icon: 'k8s'
	};
	onMount(() => startAutoRefresh('layout:clusters'));
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

	function clusterProject(resource: Kubernetes.KubernetesClusterRead) {
		const idx = data.projects.findIndex((p) => p.metadata.id === resource.metadata.projectId);
		if (idx < 0) return null;
		return {
			name: data.projects[idx].metadata.name,
			color: PROJECT_PALETTE[idx % PROJECT_PALETTE.length]
		};
	}

	async function bulkDeleteClusters(ids: Set<string>, clear: () => void) {
		const toDelete = data.clusters.filter((c) => ids.has(c.metadata.id));
		await Promise.allSettled(
			toDelete.map((c) =>
				Clients.kubernetes().apiV1OrganizationsOrganizationIDProjectsProjectIDClustersClusterIDDelete(
					{
						organizationID: data.organizationID,
						projectID: c.metadata.projectId,
						clusterID: c.metadata.id
					}
				)
			)
		);
		clear();
		invalidate('layout:clusters');
	}

	function deleteCluster(resource: Kubernetes.KubernetesClusterRead) {
		Clients.kubernetes()
			.apiV1OrganizationsOrganizationIDProjectsProjectIDClustersClusterIDDelete({
				organizationID: data.organizationID,
				projectID: resource.metadata.projectId,
				clusterID: resource.metadata.id
			})
			.then(() => invalidate('layout:clusters'))
			.catch((e: Error) => Clients.error(e));
	}
	function downloadKubeconfig(resource: Kubernetes.KubernetesClusterRead) {
		Clients.kubernetes()
			.apiV1OrganizationsOrganizationIDProjectsProjectIDClustersClusterIDKubeconfigGetRaw({
				organizationID: data.organizationID,
				projectID: resource.metadata.projectId,
				clusterID: resource.metadata.id
			})
			.then(async (response) => {
				const text = await response.raw.text();
				const a = document.createElement('a');
				a.href = URL.createObjectURL(new Blob([text], { type: 'application/yaml' }));
				a.download = `kubeconfig-${resource.metadata.name}.yaml`;
				a.click();
			})
			.catch((e: Error) => Clients.error(e));
	}
</script>

<ListPage
	{settings}
	resources={data.clusters}
	projects={data.projectID ? [] : data.projects}
	regions={data.regions}
	tableHeaders={['Name', 'Status', 'Project', 'Region', 'Version', 'Owner', 'Age', '']}
>
	{#snippet bulkbar({ ids, clear })}
		<ModalIcon
			icon="trash"
			label="Delete ({ids.size})"
			class="btn btn--sm btn--danger"
			title="Delete {ids.size} cluster{ids.size === 1 ? '' : 's'}?"
			confirm={() => bulkDeleteClusters(ids, clear)}
		>
			This will permanently remove {ids.size} cluster{ids.size === 1 ? '' : 's'} and all workloads.
		</ModalIcon>
	{/snippet}

	{#snippet tableRow(resource)}
		{@const chip = resolveChip(
			resource.metadata.provisioningStatus,
			fromHealthStatus(resource.metadata.healthStatus)
		)}
		{@const proj = clusterProject(resource)}
		<td class="primary">
			<div>{resource.metadata.name}</div>
			<div class="sub">{resource.metadata.id}</div>
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
				{RegionUtil.flag(data.regions, resource.spec.regionId)}
				{RegionUtil.name(data.regions, resource.spec.regionId)}
			</span>
		</td>
		<td><span class="mono">{resource.spec.version}</span></td>
		<td>{resource.metadata.createdBy}</td>
		<td><span class="mono">{ageFormatter(resource.metadata.creationTime)}</span></td>
		<RowMenu>
			{#snippet menu()}
				<div class="menu__title">Access</div>
				<button class="menu__item" onclick={() => downloadKubeconfig(resource)}>
					<Icon name="download" size={14} /> Download kubeconfig
				</button>
				<div class="menu__title">Danger</div>
				<ModalIcon
					icon="trash"
					label="Delete"
					class="menu__item menu__item--danger"
					title="Delete cluster?"
					confirm={() => deleteCluster(resource)}
				>
					Removing "{resource.metadata.name}" will destroy all workloads.
				</ModalIcon>
			{/snippet}
		</RowMenu>
	{/snippet}

	{#snippet tools()}
		{#if data.projects.length}
			<PopupButton icon="plus" label="Create">
				{#snippet contents()}
					<div class="create-popup">
						<div class="create-popup__label">Project</div>
						<div class="picker">
							<Icon name="folder" size={14} /><select bind:value={createProjectID}
								>{#each data.projects as p}<option value={p.metadata.id}>{p.metadata.name}</option
									>{/each}</select
							>
						</div>
						<div class="create-popup__label">Region</div>
						<div class="picker">
							<Icon name="globe" size={14} /><select bind:value={createRegionID}
								>{#each data.regions as r}<option value={r.metadata.id}>{r.metadata.name}</option
									>{/each}</select
							>
						</div>
						<a
							href="/kubernetes/clusters/create?projectID={createProjectID}&regionID={createRegionID}"
							class="btn btn--primary">Continue</a
						>
					</div>
				{/snippet}
			</PopupButton>
		{/if}
	{/snippet}
	{#snippet list(clusters)}<ShellList
			>{#each clusters as resource}<ShellListItem id={resource.metadata.id}>
					{#snippet main()}<ShellListItemHeader metadata={resource.metadata} />{/snippet}
					{#snippet badges()}
						<ShellListItemBadges
							metadata={resource.metadata}
							projects={data.projects}
							operationalStatus={fromHealthStatus(resource.metadata.healthStatus)}
						>
							{#snippet extra()}<Badge
									>{RegionUtil.flag(data.regions, resource.spec.regionId)}
									{RegionUtil.name(data.regions, resource.spec.regionId)}</Badge
								>{/snippet}
						</ShellListItemBadges>
					{/snippet}
					{#snippet menu()}
						<div class="menu__title">Access</div>
						<button class="menu__item" onclick={() => downloadKubeconfig(resource)}>
							<Icon name="download" size={14} /> Download kubeconfig
						</button>
						<div class="menu__title">Danger</div>
						<ModalIcon
							icon="trash"
							label="Delete"
							class="menu__item menu__item--danger"
							title="Delete cluster?"
							confirm={() => deleteCluster(resource)}
						>
							Removing "{resource.metadata.name}" will destroy all workloads.
						</ModalIcon>
					{/snippet}
					<ShellListItemMetadata metadata={resource.metadata} />
				</ShellListItem>{/each}</ShellList
		>{/snippet}
	{#snippet empty()}<Placeholder>No Kubernetes clusters yet.</Placeholder>{/snippet}
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
