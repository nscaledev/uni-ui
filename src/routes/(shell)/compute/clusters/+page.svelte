<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { navigating } from '$app/state';
	import { browser } from '$app/environment';

	let { data }: { data: PageData } = $props();

	import * as Clients from '$lib/clients';
	import * as Compute from '$lib/openapi/compute';
	import * as RegionUtil from '$lib/regionutil';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellList from '$lib/layouts/ShellList.svelte';
	import ShellListItem from '$lib/layouts/ShellListItem.svelte';
	import ShellListItemHeader from '$lib/layouts/ShellListItemHeader.svelte';
	import ShellListItemBadges from '$lib/layouts/ShellListItemBadges.svelte';
	import ShellListItemMetadata from '$lib/layouts/ShellListItemMetadata.svelte';
	import Badge from '$lib/layouts/Badge.svelte';
	import PopupButton from '$lib/forms/PopupButton.svelte';
	import SubtleButton from '$lib/forms/SubtleButton.svelte';
	import ModalIcon from '$lib/layouts/ModalIcon.svelte';
	import Placeholder from '$lib/layouts/Placeholder.svelte';

	const settings: ShellPageSettings = {
		feature: 'Infrastructure',
		name: 'Compute Clusters',
		description: 'Manage your Compute clusters.',
		icon: 'mdi:server-network-outline'
	};

	onMount(() => {
		const interval = setInterval(() => navigating.to || invalidate('layout:clusters'), 5000);

		return () => clearInterval(interval);
	});

	function confirm(resource: Compute.ComputeClusterRead): void {
		const parameters = {
			organizationID: data.organizationID,
			projectID: resource.metadata.projectId,
			clusterID: resource.metadata.id
		};

		Clients.compute()
			.apiV1OrganizationsOrganizationIDProjectsProjectIDClustersClusterIDDelete(parameters)
			.then(() => invalidate('layout:clusters'))
			.catch((e: Error) => Clients.error(e));
	}

	function getSSHKey(resource: Compute.ComputeClusterRead): void {
		if (browser && resource.status?.sshPrivateKey) {
			const url = window.URL.createObjectURL(new Blob([resource.status.sshPrivateKey]));

			const a = document.createElement('a');
			a.style.display = 'none';
			a.href = url;
			a.download = `id_${resource.metadata.name}`;

			document.body.appendChild(a);
			a.click();

			window.URL.revokeObjectURL(url);
		}
	}

	function initialCreateProjectID(): string | undefined {
		return data.projects[0]?.metadata.id;
	}

	function initialCreateRegionID(): string | undefined {
		return data.regions[0]?.metadata.id;
	}

	let createProjectID = $state(initialCreateProjectID());
	let createRegionID = $state(initialCreateRegionID());
</script>

<ShellPageHeader {settings}>
	{#snippet tools()}
		{#if data.projects.length}
			<PopupButton icon="mdi:add" class="self-end" label="Create">
				{#snippet contents()}
					<div class="flex flex-col gap-4">
						<div class="font-bold">Project</div>

						<div class="input-group grid grid-cols-[auto_1fr]">
							<iconify-icon icon="mdi:folder-open-outline" class="ig-cell"></iconify-icon>

							<select class="ig-select" bind:value={createProjectID}>
								{#each data.projects as p}
									<option value={p.metadata.id}>{p.metadata.name}</option>
								{/each}
							</select>
						</div>

						<div class="font-bold">Region</div>

						<div class="input-group grid grid-cols-[auto_1fr]">
							<iconify-icon
								icon={RegionUtil.icon(data.regions, createRegionID || '')}
								class="ig-cell"
							></iconify-icon>

							<select class="ig-select" bind:value={createRegionID}>
								{#each data.regions as r}
									<option value={r.metadata.id}>{r.metadata.name}</option>
								{/each}
							</select>
						</div>

						<a
							href="/compute/clusters/create?projectID={createProjectID}&regionID={createRegionID}"
							class="btn preset-filled-primary-500">Create</a
						>
					</div>
				{/snippet}
			</PopupButton>
		{/if}
	{/snippet}
</ShellPageHeader>

{#if data.projects.length == 0}
	<Placeholder
		>You are not yet a member of any projects, ask an administrator to create one.</Placeholder
	>
{:else if data.clusters.length == 0}
	<Placeholder>No clusters to display, create one to get started.</Placeholder>
{:else}
	<ShellList>
		{#each data.clusters as resource}
			<ShellListItem>
				{#snippet main()}
					<ShellListItemHeader
						metadata={resource.metadata}
						projects={data.projects}
						href="/compute/clusters/view/{resource.metadata.id}"
					/>
				{/snippet}

				{#snippet badges()}
					<ShellListItemBadges metadata={resource.metadata}>
						{#snippet extra()}
							<Badge icon={RegionUtil.icon(data.regions, resource.spec.regionId)}>
								{RegionUtil.name(data.regions, resource.spec.regionId)}
							</Badge>
						{/snippet}
					</ShellListItemBadges>
				{/snippet}

				<ShellListItemMetadata metadata={resource.metadata} />

				{#snippet trail()}
					<SubtleButton icon="mdi:connection" label="SSH Key" clicked={() => getSSHKey(resource)} />
					<ModalIcon
						icon="mdi:trash-can-outline"
						label="Delete"
						title="Are you sure?"
						confirm={() => confirm(resource)}
					></ModalIcon>
				{/snippet}
			</ShellListItem>
		{/each}
	</ShellList>
{/if}
