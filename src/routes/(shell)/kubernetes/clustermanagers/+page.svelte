<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { startAutoRefresh } from '$lib/loadutil';
	let { data }: { data: PageData } = $props();
	import * as Clients from '$lib/clients';
	import * as Kubernetes from '$lib/openapi/kubernetes';
	import { resolveChip } from '$lib/layouts/effectiveStatus';
	import { ageFormatter } from '$lib/formatters';
	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ListPage from '$lib/layouts/ListPage.svelte';
	import ShellList from '$lib/layouts/ShellList.svelte';
	import ShellListItem from '$lib/layouts/ShellListItem.svelte';
	import ShellListItemHeader from '$lib/layouts/ShellListItemHeader.svelte';
	import ShellListItemBadges from '$lib/layouts/ShellListItemBadges.svelte';
	import ShellListItemMetadata from '$lib/layouts/ShellListItemMetadata.svelte';
	import Placeholder from '$lib/layouts/Placeholder.svelte';
	import ModalIcon from '$lib/layouts/ModalIcon.svelte';
	const settings: ShellPageSettings = {
		feature: 'Kubernetes',
		name: 'Cluster Managers',
		description: 'Control plane managers for Kubernetes clusters.',
		icon: 'k8s'
	};
	onMount(() => startAutoRefresh('layout:clustermanagers'));
	async function bulkDeleteManagers(ids: Set<string>, clear: () => void) {
		const toDelete = data.clustermanagers.filter((m) => ids.has(m.metadata.id));
		await Promise.allSettled(
			toDelete.map((m) =>
				Clients.kubernetes().apiV1OrganizationsOrganizationIDProjectsProjectIDClustermanagersClusterManagerIDDelete(
					{
						organizationID: data.organizationID,
						projectID: m.metadata.projectId,
						clusterManagerID: m.metadata.id
					}
				)
			)
		);
		clear();
		invalidate('layout:clustermanagers');
	}

	function deleteManager(resource: Kubernetes.ClusterManagerRead) {
		Clients.kubernetes()
			.apiV1OrganizationsOrganizationIDProjectsProjectIDClustermanagersClusterManagerIDDelete({
				organizationID: data.organizationID,
				projectID: resource.metadata.projectId,
				clusterManagerID: resource.metadata.id
			})
			.then(() => invalidate('layout:clustermanagers'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<ListPage
	{settings}
	resources={data.clustermanagers}
	tableHeaders={['Name', 'Status', 'Owner', 'Age', '']}
>
	{#snippet bulkbar({ ids, clear })}
		<ModalIcon
			icon="trash"
			label="Delete ({ids.size})"
			class="btn btn--sm btn--danger"
			title="Delete {ids.size} cluster manager{ids.size === 1 ? '' : 's'}?"
			confirm={() => bulkDeleteManagers(ids, clear)}
		>
			This will remove {ids.size} cluster manager{ids.size === 1 ? '' : 's'} and all their clusters.
		</ModalIcon>
	{/snippet}

	{#snippet tableRow(resource)}
		{@const chip = resolveChip(resource.metadata.provisioningStatus, null)}
		<td class="primary">
			<div>{resource.metadata.name}</div>
			<div class="sub">{resource.metadata.id}</div>
		</td>
		<td>
			{#if chip}<span class="chip chip--{chip.chipClass}"
					><span class="dot"></span>{chip.label}</span
				>{/if}
		</td>
		<td>{resource.metadata.createdBy}</td>
		<td><span class="mono">{ageFormatter(resource.metadata.creationTime)}</span></td>
		<td></td>
	{/snippet}
	{#snippet list(managers)}<ShellList
			>{#each managers as resource}<ShellListItem id={resource.metadata.id}>
					{#snippet main()}<ShellListItemHeader metadata={resource.metadata} />{/snippet}
					{#snippet badges()}<ShellListItemBadges
							metadata={resource.metadata}
							projects={data.projects}
						/>{/snippet}
					{#snippet menu()}<ModalIcon
							icon="trash"
							label="Delete"
							class="menu__item menu__item--danger"
							title="Delete cluster manager?"
							confirm={() => deleteManager(resource)}
							>Removing "{resource.metadata.name}" will remove all clusters it manages.</ModalIcon
						>{/snippet}
					<ShellListItemMetadata metadata={resource.metadata} />
				</ShellListItem>{/each}</ShellList
		>{/snippet}
	{#snippet empty()}<Placeholder>No cluster managers.</Placeholder>{/snippet}
</ListPage>
