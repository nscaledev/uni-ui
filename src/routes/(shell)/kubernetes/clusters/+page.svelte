<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { startAutoRefresh } from '$lib/loadutil';
	let { data }: { data: PageData } = $props();
	import * as Clients from '$lib/clients';
	import * as Kubernetes from '$lib/openapi/kubernetes';
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

<ListPage {settings} resources={data.clusters}>
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
			>{#each clusters as resource}<ShellListItem>
					{#snippet main()}<ShellListItemHeader
							metadata={resource.metadata}
							projects={data.projects}
						/>{/snippet}
					{#snippet badges()}
						<ShellListItemBadges metadata={resource.metadata}>
							{#snippet extra()}<Badge
									>{RegionUtil.flag(data.regions, resource.spec.regionId)}
									{RegionUtil.name(data.regions, resource.spec.regionId)}</Badge
								>{/snippet}
						</ShellListItemBadges>
					{/snippet}
					{#snippet trail()}
						<button
							class="btn btn--ghost"
							onclick={() => downloadKubeconfig(resource)}
							title="Download kubeconfig"><Icon name="download" size={16} /></button
						>
						<ModalIcon icon="trash" title="Delete cluster?" confirm={() => deleteCluster(resource)}
							>Removing "{resource.metadata.name}" will destroy all workloads.</ModalIcon
						>
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
