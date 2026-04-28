<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { startAutoRefresh } from '$lib/loadutil';

	let { data }: { data: PageData } = $props();

	import * as Clients from '$lib/clients';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellList from '$lib/layouts/ShellList.svelte';
	import ShellListItem from '$lib/layouts/ShellListItem.svelte';
	import ShellListItemHeader from '$lib/layouts/ShellListItemHeader.svelte';
	import ShellListItemBadges from '$lib/layouts/ShellListItemBadges.svelte';
	import ShellListItemMetadata from '$lib/layouts/ShellListItemMetadata.svelte';
	import SubtleButton from '$lib/forms/SubtleButton.svelte';
	import ModalIcon from '$lib/layouts/ModalIcon.svelte';

	const settings: ShellPageSettings = {
		feature: 'Identity',
		name: 'Projects',
		description:
			'Projects bind groups of users to projects and allow infrastructure to be provisioned within them.',
		icon: 'folder'
	};

	onMount(() => startAutoRefresh('layout:projects'));

	function confirm(id: string): void {
		const parameters = {
			organizationID: data.organizationID,
			projectID: id
		};

		Clients.identity()
			.apiV1OrganizationsOrganizationIDProjectsProjectIDDelete(parameters)
			.then(() => invalidate('layout:projects'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<ShellPageHeader {settings}>
	{#snippet tools()}
		<SubtleButton icon="plus" label="Create" href="/identity/projects/create" />
	{/snippet}
</ShellPageHeader>

<ShellList>
	{#each data.projects || [] as resource}
		<ShellListItem>
			{#snippet main()}
				<ShellListItemHeader metadata={resource.metadata} />
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
					confirm={() => confirm(resource.metadata.id)}
				>
					Removing project "{resource.metadata.name}" will remove all infrastructure owned by it.
				</ModalIcon>
			{/snippet}
		</ShellListItem>
	{/each}
</ShellList>
