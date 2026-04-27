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
		name: 'Groups',
		description: 'Groups bind users and service accounts to roles.',
		icon: 'mdi:account-group-outline'
	};

	onMount(() => startAutoRefresh('layout:groups'));

	function confirm(id: string) {
		const parameters = {
			organizationID: data.organizationID,
			groupid: id
		};

		Clients.identity()
			.apiV1OrganizationsOrganizationIDGroupsGroupidDelete(parameters)
			.then(() => invalidate('page:groups'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<ShellPageHeader {settings}>
	{#snippet tools()}
		<SubtleButton icon="mdi:add" label="Create" href="/identity/groups/create" />
	{/snippet}
</ShellPageHeader>

<ShellList>
	{#each data.groups || [] as resource}
		<ShellListItem>
			{#snippet main()}
				<ShellListItemHeader
					metadata={resource.metadata}
					href="/identity/groups/view/{resource.metadata.id}"
				/>
			{/snippet}

			{#snippet badges()}
				<ShellListItemBadges metadata={resource.metadata} />
			{/snippet}

			<ShellListItemMetadata metadata={resource.metadata} />

			{#snippet trail()}
				<ModalIcon
					icon="mdi:trash-can-outline"
					label="Delete"
					title="Are you sure?"
					confirm={() => confirm(resource.metadata.id)}
				>
					Removing group "{resource.metadata.name}" disassociate any projects referencing it.
				</ModalIcon>
			{/snippet}
		</ShellListItem>
	{/each}
</ShellList>
