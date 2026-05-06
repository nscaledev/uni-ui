<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { startAutoRefresh } from '$lib/loadutil';
	let { data }: { data: PageData } = $props();
	import * as Clients from '$lib/clients';
	import * as Identity from '$lib/openapi/identity';
	import { resolveChip } from '$lib/layouts/effectiveStatus';
	import { ageFormatter } from '$lib/formatters';
	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ListPage from '$lib/layouts/ListPage.svelte';
	import ShellList from '$lib/layouts/ShellList.svelte';
	import ShellListItem from '$lib/layouts/ShellListItem.svelte';
	import ShellListItemHeader from '$lib/layouts/ShellListItemHeader.svelte';
	import ShellListItemBadges from '$lib/layouts/ShellListItemBadges.svelte';
	import ShellListItemMetadata from '$lib/layouts/ShellListItemMetadata.svelte';
	import ShellMetadataItem from '$lib/layouts/ShellMetadataItem.svelte';
	import Placeholder from '$lib/layouts/Placeholder.svelte';
	import Button from '$lib/forms/Button.svelte';
	import ModalIcon from '$lib/layouts/ModalIcon.svelte';
	import Clipboard from '$lib/forms/Clipboard.svelte';
	import RowMenu from '$lib/layouts/RowMenu.svelte';
	import Icon from '$lib/primitives/Icon.svelte';
	const settings: ShellPageSettings = {
		feature: 'Identity',
		name: 'Service Accounts',
		description: 'Machine accounts for automation.',
		icon: 'key'
	};
	onMount(() => startAutoRefresh('layout:serviceaccounts'));

	let rotatedToken: string | undefined = $state();

	async function bulkDeleteServiceAccounts(ids: Set<string>, clear: () => void) {
		await Promise.allSettled(
			[...ids].map((id) =>
				Clients.identity().apiV1OrganizationsOrganizationIDServiceaccountsServiceAccountIDDelete({
					organizationID: data.organizationID,
					serviceAccountID: id
				})
			)
		);
		clear();
		invalidate('layout:serviceaccounts');
	}

	function deleteServiceAccount(id: string) {
		Clients.identity()
			.apiV1OrganizationsOrganizationIDServiceaccountsServiceAccountIDDelete({
				organizationID: data.organizationID,
				serviceAccountID: id
			})
			.then(() => invalidate('layout:serviceaccounts'))
			.catch((e: Error) => Clients.error(e));
	}

	function rotateServiceAccount(id: string) {
		Clients.identity()
			.apiV1OrganizationsOrganizationIDServiceaccountsServiceAccountIDRotatePost({
				organizationID: data.organizationID,
				serviceAccountID: id
			})
			.then((result: Identity.ServiceAccountCreate) => {
				rotatedToken = result.status.accessToken;
				invalidate('layout:serviceaccounts');
			})
			.catch((e: Error) => Clients.error(e));
	}
</script>

{#if rotatedToken}
	<div class="token-reveal">
		<div class="token-reveal__header">
			<Icon name="key" size={16} />
			<span>New access token — copy it now, it won't be shown again.</span>
		</div>
		<Clipboard id="rotated-token" value={rotatedToken} />
		<button class="btn btn--ghost btn--sm" onclick={() => (rotatedToken = undefined)}
			>Dismiss</button
		>
	</div>
{/if}

<ListPage
	{settings}
	resources={data.serviceAccounts || []}
	tableHeaders={['Name', 'Status', 'Expiry', 'Owner', 'Age', '']}
>
	{#snippet bulkbar({ ids, clear })}
		<ModalIcon
			icon="trash"
			label="Delete ({ids.size})"
			class="btn btn--sm btn--danger"
			title="Delete {ids.size} service account{ids.size === 1 ? '' : 's'}?"
			confirm={() => bulkDeleteServiceAccounts(ids, clear)}
		>
			This will permanently remove {ids.size} service account{ids.size === 1 ? '' : 's'}.
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
		<td><span class="mono">{resource.status.expiry.toISOString().slice(0, 10)}</span></td>
		<td>{resource.metadata.createdBy}</td>
		<td><span class="mono">{ageFormatter(resource.metadata.creationTime)}</span></td>
		<RowMenu>
			{#snippet menu()}
				<button class="menu__item" onclick={() => rotateServiceAccount(resource.metadata.id)}>
					<Icon name="refresh" size={14} /> Rotate token
				</button>
				<ModalIcon
					icon="trash"
					label="Delete"
					class="menu__item menu__item--danger"
					title="Delete service account?"
					confirm={() => deleteServiceAccount(resource.metadata.id)}
					>Removing "{resource.metadata.name}" may break automation.</ModalIcon
				>
			{/snippet}
		</RowMenu>
	{/snippet}

	{#snippet tools()}<Button
			icon="plus"
			label="Create"
			class="btn--primary"
			href="/identity/serviceaccounts/create"
			disabled={!data.groups.length}
		/>{/snippet}
	{#snippet list(accounts)}<ShellList
			>{#each accounts as resource}<ShellListItem id={resource.metadata.id}>
					{#snippet main()}<ShellListItemHeader metadata={resource.metadata} />{/snippet}
					{#snippet badges()}<ShellListItemBadges metadata={resource.metadata} />{/snippet}
					{#snippet menu()}
						<button class="menu__item" onclick={() => rotateServiceAccount(resource.metadata.id)}>
							<Icon name="refresh" size={14} /> Rotate token
						</button>
						<ModalIcon
							icon="trash"
							label="Delete"
							class="menu__item menu__item--danger"
							title="Delete service account?"
							confirm={() => deleteServiceAccount(resource.metadata.id)}
							>Removing "{resource.metadata.name}" may break automation.</ModalIcon
						>
					{/snippet}
					<ShellListItemMetadata metadata={resource.metadata} />
					<ShellMetadataItem
						icon="clock"
						label="Expiry"
						value={resource.status.expiry.toUTCString()}
					/>
				</ShellListItem>{/each}</ShellList
		>{/snippet}
	{#snippet empty()}
		{#if !data.groups.length}
			<Placeholder
				>No groups exist yet — create a group before adding a service account.</Placeholder
			>
		{:else}
			<Placeholder>No service accounts yet — create one to get started.</Placeholder>
		{/if}
	{/snippet}
</ListPage>

<style>
	.token-reveal {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 14px 16px;
		margin-bottom: 16px;
		background: color-mix(in oklch, var(--warn, #f59e0b) 8%, var(--bg-0));
		border: 1px solid color-mix(in oklch, var(--warn, #f59e0b) 30%, transparent);
		border-radius: var(--r-md);
	}
	.token-reveal__header {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		font-weight: 500;
		color: var(--text-1);
	}
</style>
