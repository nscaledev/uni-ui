<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';

	let { data }: { data: PageData } = $props();

	import * as Clients from '$lib/clients';
	import * as Identity from '$lib/openapi/identity';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellViewHeader from '$lib/layouts/ShellViewHeader.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ShellMetadataItem from '$lib/layouts/ShellMetadataItem.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import MultiSelect from '$lib/forms/MultiSelect.svelte';
	import Button from '$lib/forms/Button.svelte';
	import Clipboard from '$lib/forms/Clipboard.svelte';

	const settings: ShellPageSettings = {
		feature: 'Identity',
		name: 'View/Update Service Account',
		description: 'Manage your service account.',
		icon: 'mdi:account-service-outline'
	};

	let serviceAccount = $derived.by(() => {
		let serviceAccount = $state(data.serviceAccount);
		return serviceAccount;
	});

	function submit() {
		const parameters = {
			organizationID: data.organizationID,
			serviceAccountID: $page.params.id,
			serviceAccountWrite: serviceAccount
		};

		Clients.identity()
			.apiV1OrganizationsOrganizationIDServiceaccountsServiceAccountIDPut(parameters)
			.then(() => window.location.assign('/identity/serviceaccounts'))
			.catch((e: Error) => Clients.error(e));
	}

	let newServiceAccount: Identity.ServiceAccountCreate | undefined = $state();

	function rotate() {
		const parameters = {
			organizationID: data.organizationID,
			serviceAccountID: $page.params.id
		};

		Clients.identity()
			.apiV1OrganizationsOrganizationIDServiceaccountsServiceAccountIDRotatePost(parameters)
			.then((v: Identity.ServiceAccountCreate) => (newServiceAccount = v))
			.catch((e: Error) => Clients.error(e));
	}

	let groups = $derived(data.groups.map((x) => ({ label: x.metadata.name, value: x.metadata.id })));
</script>

<ShellPageHeader {settings} />
{#if newServiceAccount}
	<ShellViewHeader metadata={newServiceAccount.metadata}>
		{#snippet extraMetadata()}
			<ShellMetadataItem
				icon="mdi:key-outline"
				label="Expiry"
				value={newServiceAccount?.status.expiry.toUTCString() || 'unknown'}
			/>
		{/snippet}
	</ShellViewHeader>

	<ShellSection title="Access Token">
		<p>
			<em>This token will only be shown once, so make a copy and keep it secure.</em>
		</p>
		<Clipboard id="access-token" value={newServiceAccount.status.accessToken || ''} />
	</ShellSection>

	<div class="flex">
		<Button
			icon="mdi:tick"
			label="Done"
			class="preset-filled-primary-500"
			href="/identity/serviceaccounts"
		/>
	</div>
{:else}
	<ShellViewHeader metadata={serviceAccount.metadata}>
		{#snippet extraMetadata()}
			<ShellMetadataItem
				icon="mdi:key-outline"
				label="Expiry"
				value={serviceAccount?.status.expiry.toUTCString()}
			/>
		{/snippet}
	</ShellViewHeader>

	<ShellMetadataSection metadata={serviceAccount.metadata} />

	<ShellSection title="Access Control">
		<MultiSelect
			label="Select group access."
			hint="Groups associate users with projects and grant them permissions to create, view, edit and delete."
			options={groups}
			value={serviceAccount.spec.groupIDs}
			onValueChange={(e) => (serviceAccount.spec.groupIDs = e.value)}
		>
			{#snippet selected(value: string)}
				{data.groups.find((x) => x.metadata.id == value)?.metadata.name}
			{/snippet}
		</MultiSelect>
	</ShellSection>

	<div class="flex flex-wrap justify-between gap-4">
		<Button
			icon="mdi:cancel-bold"
			label="Cancel"
			class="preset-outlined-surface-600-400"
			href="/identity/serviceaccounts"
		/>
		<Button
			icon="mdi:refresh"
			label="Refresh Access Token"
			class="preset-outlined-surface-600-400"
			clicked={rotate}
		/>

		<Button icon="mdi:tick" label="Update" class="preset-filled-primary-500" clicked={submit} />
	</div>
{/if}
