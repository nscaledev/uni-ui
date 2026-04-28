<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { startAutoRefresh } from '$lib/loadutil';

	let { data }: { data: PageData } = $props();

	import * as Clients from '$lib/clients';
	import * as Kubernetes from '$lib/openapi/kubernetes';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellList from '$lib/layouts/ShellList.svelte';
	import ShellListItem from '$lib/layouts/ShellListItem.svelte';
	import ShellListItemHeader from '$lib/layouts/ShellListItemHeader.svelte';
	import ShellListItemBadges from '$lib/layouts/ShellListItemBadges.svelte';
	import ShellListItemMetadata from '$lib/layouts/ShellListItemMetadata.svelte';
	import ModalIcon from '$lib/layouts/ModalIcon.svelte';

	const settings: ShellPageSettings = {
		feature: 'Infrastructure',
		name: 'Kubernetes Cluster Managers',
		description: 'Manage your Kubernetes cluster life-cycle managers.',
		icon: 'k8s'
	};

	onMount(() => startAutoRefresh('layout:clustermanagers'));

	function confirm(resource: Kubernetes.ClusterManagerRead): void {
		const parameters = {
			organizationID: data.organizationID,
			projectID: resource.metadata.projectId,
			clusterManagerID: resource.metadata.id
		};

		Clients.kubernetes()
			.apiV1OrganizationsOrganizationIDProjectsProjectIDClustermanagersClusterManagerIDDelete(
				parameters
			)
			.then(() => invalidate('layout:clustermanagers'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<ShellPageHeader {settings} />
<ShellList>
	{#each data.clustermanagers as resource}
		<ShellListItem>
			{#snippet main()}
				<ShellListItemHeader metadata={resource.metadata} projects={data.projects} />
			{/snippet}

			{#snippet badges()}
				<ShellListItemBadges metadata={resource.metadata} />
			{/snippet}

			<ShellListItemMetadata metadata={resource.metadata} />

			{#snippet trail()}
				<ModalIcon
					icon="trash"
					label="Delete"
					title="Are you sure?"
					confirm={() => confirm(resource)}
				>
					Removing cluster manager "{resource.metadata.name}" will remove any clusters managed by
					it.
				</ModalIcon>
			{/snippet}
		</ShellListItem>
	{/each}
</ShellList>
