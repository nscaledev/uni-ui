<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { startAutoRefresh } from '$lib/loadutil';
	let { data }: { data: PageData } = $props();
	import * as Clients from '$lib/clients';
	import * as Identity from '$lib/openapi/identity';
	import { resolveChip, fromUserState } from '$lib/layouts/effectiveStatus';
	import * as Formatters from '$lib/formatters';
	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ListPage from '$lib/layouts/ListPage.svelte';
	import ShellList from '$lib/layouts/ShellList.svelte';
	import ShellListItem from '$lib/layouts/ShellListItem.svelte';
	import ShellListItemHeader from '$lib/layouts/ShellListItemHeader.svelte';
	import ShellListItemBadges from '$lib/layouts/ShellListItemBadges.svelte';
	import ShellListItemMetadata from '$lib/layouts/ShellListItemMetadata.svelte';
	import ShellMetadataItem from '$lib/layouts/ShellMetadataItem.svelte';
	import Placeholder from '$lib/layouts/Placeholder.svelte';
	import SubtleButton from '$lib/forms/SubtleButton.svelte';
	import ModalIcon from '$lib/layouts/ModalIcon.svelte';
	const settings: ShellPageSettings = {
		feature: 'Identity',
		name: 'Users',
		description: 'Known user accounts permitted access to the organization.',
		icon: 'user'
	};
	onMount(() => startAutoRefresh('layout:users'));
	function userLastActive(u: Identity.UserRead) {
		return u.status.lastActive ? Formatters.ageFormatter(u.status.lastActive) : 'never';
	}
	async function bulkDeleteUsers(ids: Set<string>, clear: () => void) {
		await Promise.allSettled(
			[...ids].map((id) =>
				Clients.identity().apiV1OrganizationsOrganizationIDUsersUserIDDelete({
					organizationID: data.organizationID,
					userID: id
				})
			)
		);
		clear();
		invalidate('layout:users');
	}

	function deleteUser(id: string) {
		Clients.identity()
			.apiV1OrganizationsOrganizationIDUsersUserIDDelete({
				organizationID: data.organizationID,
				userID: id
			})
			.then(() => invalidate('layout:users'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<ListPage
	{settings}
	resources={data.users || []}
	filterFn={(r, q) => r.spec.subject.toLowerCase().includes(q)}
	tableHeaders={['Subject', 'Status', 'Last Active', 'Age', '']}
>
	{#snippet bulkbar({ ids, clear })}
		<ModalIcon
			icon="trash"
			label="Delete ({ids.size})"
			class="btn btn--sm btn--danger"
			title="Delete {ids.size} user{ids.size === 1 ? '' : 's'}?"
			confirm={() => bulkDeleteUsers(ids, clear)}
		>
			This will remove {ids.size} user{ids.size === 1 ? '' : 's'} from the organization.
		</ModalIcon>
	{/snippet}

	{#snippet tableRow(resource)}
		{@const chip = resolveChip(
			resource.metadata.provisioningStatus,
			fromUserState(resource.spec.state)
		)}
		<td class="primary">
			<div>{resource.spec.subject}</div>
			<div class="sub">{resource.metadata.id}</div>
		</td>
		<td>
			{#if chip}<span class="chip chip--{chip.chipClass}"
					><span class="dot"></span>{chip.label}</span
				>{/if}
		</td>
		<td>{userLastActive(resource)}</td>
		<td><span class="mono">{Formatters.ageFormatter(resource.metadata.creationTime)}</span></td>
		<td></td>
	{/snippet}

	{#snippet tools()}<SubtleButton
			icon="plus"
			label="Create"
			href="/identity/users/create"
		/>{/snippet}
	{#snippet list(users)}<ShellList
			>{#each users as resource}<ShellListItem id={resource.metadata.id}>
					{#snippet main()}<ShellListItemHeader title={resource.spec.subject} />{/snippet}
					{#snippet badges()}
						<ShellListItemBadges
							metadata={resource.metadata}
							operationalStatus={fromUserState(resource.spec.state)}
						/>
					{/snippet}
					{#snippet menu()}<ModalIcon
							icon="trash"
							label="Delete"
							class="menu__item menu__item--danger"
							title="Delete user?"
							confirm={() => deleteUser(resource.metadata.id)}
						/>{/snippet}
					<ShellListItemMetadata metadata={resource.metadata} />
					<ShellMetadataItem icon="bolt" label="Last Active" value={userLastActive(resource)} />
				</ShellListItem>{/each}</ShellList
		>{/snippet}
	{#snippet empty()}<Placeholder>No users yet.</Placeholder>{/snippet}
</ListPage>
