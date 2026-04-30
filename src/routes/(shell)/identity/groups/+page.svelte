<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { startAutoRefresh } from '$lib/loadutil';

	let { data }: { data: PageData } = $props();

	import * as Clients from '$lib/clients';
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
	import SubtleButton from '$lib/forms/SubtleButton.svelte';
	import ModalIcon from '$lib/layouts/ModalIcon.svelte';
	import Icon from '$lib/primitives/Icon.svelte';

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

<ListPage
	{settings}
	resources={data.groups || []}
	tableHeaders={['Name', 'Status', 'Members', 'Owner', 'Age', '']}
>
	{#snippet tableRow(resource)}
		{@const chip = resolveChip(resource.metadata.provisioningStatus, null)}
		{@const members = (resource.spec.userIDs?.length ?? 0) + resource.spec.serviceAccountIDs.length}
		<tr>
			<td class="primary">
				<div>{resource.metadata.name}</div>
				<div class="sub">{resource.metadata.id}</div>
			</td>
			<td>
				{#if chip}<span class="chip chip--{chip.chipClass}"
						><span class="dot"></span>{chip.label}</span
					>{/if}
			</td>
			<td>{members}</td>
			<td>{resource.metadata.createdBy}</td>
			<td><span class="mono">{ageFormatter(resource.metadata.creationTime)}</span></td>
			<td class="col-actions">
				<a class="row-action" href="/identity/groups/view/{resource.metadata.id}" title="View">
					<Icon name="eye" size={14} />
				</a>
			</td>
		</tr>
	{/snippet}

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
					{#snippet menu()}
						<ModalIcon
							icon="trash"
							label="Delete"
							class="menu__item menu__item--danger"
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
