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
	import ShellMetadataItem from '$lib/layouts/ShellMetadataItem.svelte';
	import SubtleButton from '$lib/forms/SubtleButton.svelte';
	import ModalIcon from '$lib/layouts/ModalIcon.svelte';

	const settings: ShellPageSettings = {
		feature: 'Identity',
		name: 'Service Accounts',
		description: 'Service accounts provide long-lived user accounts for use with CLI tooling.',
		icon: 'mdi:account-service-outline'
	};

	onMount(() => startAutoRefresh('layout:serviceaccounts'));

	function confirm(id: string) {
		const parameters = {
			organizationID: data.organizationID,
			serviceAccountID: id
		};

		Clients.identity()
			.apiV1OrganizationsOrganizationIDServiceaccountsServiceAccountIDDelete(parameters)
			.then(() => invalidate('layout:serviceaccounts'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<ShellPageHeader {settings}>
	{#snippet tools()}
		<SubtleButton icon="mdi:add" label="Create" href="/identity/serviceaccounts/create" />
	{/snippet}
</ShellPageHeader>

<ShellList>
	{#each data.serviceAccounts || [] as resource}
		<ShellListItem>
			{#snippet main()}
				<ShellListItemHeader metadata={resource.metadata} />
			{/snippet}

			{#snippet badges()}
				<ShellListItemBadges metadata={resource.metadata} />
			{/snippet}

			<ShellListItemMetadata metadata={resource.metadata}></ShellListItemMetadata>

			<ShellListItemMetadata>
				<ShellMetadataItem
					icon="mdi:key-outline"
					label="Expiry"
					value={resource.status.expiry.toUTCString()}
				/>
			</ShellListItemMetadata>

			{#snippet trail()}
				<ModalIcon
					icon="mdi:trash-can-outline"
					label="Delete"
					title="Are you sure?"
					confirm={() => confirm(resource.metadata.id)}
				>
					Removing service account "{resource.metadata.name}" may break automation.
				</ModalIcon>
			{/snippet}
		</ShellListItem>
	{/each}
</ShellList>
