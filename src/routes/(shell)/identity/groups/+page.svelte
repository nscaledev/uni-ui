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
		name: 'Groups',
		description: 'Groups bind users and service accounts to roles.',
		icon: 'users'
	};

	onMount(() => startAutoRefresh('layout:groups'));

	function deleteGroup(id: string) {
		Clients.identity()
			.apiV1OrganizationsOrganizationIDGroupsGroupidDelete({
				organizationID: data.organizationID,
				groupid: id
			})
			.then(() => invalidate('page:groups'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<ListPage {settings} resources={data.groups || []}>
	{#snippet tools()}
		<SubtleButton icon="plus" label="Create" href="/identity/groups/create" />
	{/snippet}

	{#snippet list(groups)}
		<ShellList>
			{#each groups as resource}
				<ShellListItem id={resource.metadata.id}>
					{#snippet main()}
						<ShellListItemHeader
							metadata={resource.metadata}
							href="/identity/groups/view/{resource.metadata.id}"
						/>
					{/snippet}
					{#snippet badges()}
						<ShellListItemBadges metadata={resource.metadata} />
					{/snippet}
					{#snippet trail()}
						<ModalIcon
							icon="trash"
							title="Delete group?"
							confirm={() => deleteGroup(resource.metadata.id)}
						>
							Removing "{resource.metadata.name}" will disassociate any projects referencing it.
						</ModalIcon>
					{/snippet}
					<ShellListItemMetadata metadata={resource.metadata} />
				</ShellListItem>
			{/each}
		</ShellList>
	{/snippet}

	{#snippet empty()}
		<Placeholder>No groups yet — create one to get started.</Placeholder>
	{/snippet}
</ListPage>
