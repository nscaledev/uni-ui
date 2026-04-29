<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { startAutoRefresh } from '$lib/loadutil';
	let { data }: { data: PageData } = $props();
	import * as Clients from '$lib/clients';
	import * as Kubernetes from '$lib/openapi/kubernetes';
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

<ListPage {settings} resources={data.clustermanagers}>
	{#snippet list(managers)}<ShellList
			>{#each managers as resource}<ShellListItem>
					{#snippet main()}<ShellListItemHeader metadata={resource.metadata} />{/snippet}
					{#snippet badges()}<ShellListItemBadges
							metadata={resource.metadata}
							projects={data.projects}
						/>{/snippet}
					{#snippet trail()}<ModalIcon
							icon="trash"
							title="Delete cluster manager?"
							confirm={() => deleteManager(resource)}
							>Removing "{resource.metadata.name}" will remove all clusters it manages.</ModalIcon
						>{/snippet}
					<ShellListItemMetadata metadata={resource.metadata} />
				</ShellListItem>{/each}</ShellList
		>{/snippet}
	{#snippet empty()}<Placeholder>No cluster managers.</Placeholder>{/snippet}
</ListPage>
