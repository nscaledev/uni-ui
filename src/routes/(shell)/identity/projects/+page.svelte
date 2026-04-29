<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { startAutoRefresh } from '$lib/loadutil';
	let { data }: { data: PageData } = $props();
	import * as Clients from '$lib/clients';
	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ListPage from '$lib/layouts/ListPage.svelte';
	import ShellList from '$lib/layouts/ShellList.svelte';
	import ShellListItem from '$lib/layouts/ShellListItem.svelte';
	import ShellListItemHeader from '$lib/layouts/ShellListItemHeader.svelte';
	import ShellListItemBadges from '$lib/layouts/ShellListItemBadges.svelte';
	import ShellListItemMetadata from '$lib/layouts/ShellListItemMetadata.svelte';
	import Placeholder from '$lib/layouts/Placeholder.svelte';
	import SubtleButton from '$lib/forms/SubtleButton.svelte';
	import ModalIcon from '$lib/layouts/ModalIcon.svelte';
	const settings: ShellPageSettings = {
		feature: 'Identity',
		name: 'Projects',
		description: 'Projects scope infrastructure resources.',
		icon: 'folder'
	};
	onMount(() => startAutoRefresh('layout:projects'));
	function deleteProject(id: string) {
		Clients.identity()
			.apiV1OrganizationsOrganizationIDProjectsProjectIDDelete({
				organizationID: data.organizationID,
				projectID: id
			})
			.then(() => invalidate('layout:projects'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<ListPage {settings} resources={data.projects || []}>
	{#snippet tools()}<SubtleButton
			icon="plus"
			label="Create"
			href="/identity/projects/create"
		/>{/snippet}
	{#snippet list(projects)}<ShellList
			>{#each projects as resource}<ShellListItem id={resource.metadata.id}>
					{#snippet main()}<ShellListItemHeader metadata={resource.metadata} />{/snippet}
					{#snippet badges()}<ShellListItemBadges metadata={resource.metadata} />{/snippet}
					{#snippet trail()}<ModalIcon
							icon="trash"
							title="Delete project?"
							confirm={() => deleteProject(resource.metadata.id)}
							>Removing "{resource.metadata.name}" removes all infrastructure owned by it.</ModalIcon
						>{/snippet}
					<ShellListItemMetadata metadata={resource.metadata} />
				</ShellListItem>{/each}</ShellList
		>{/snippet}
	{#snippet empty()}<Placeholder>No projects yet.</Placeholder>{/snippet}
</ListPage>
