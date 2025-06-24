<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import * as Clients from '$lib/clients';
	import * as Identity from '$lib/openapi/identity';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ShellViewHeader from '$lib/layouts/ShellViewHeader.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import MultiSelect from '$lib/forms/MultiSelect.svelte';
	import Button from '$lib/forms/Button.svelte';
	import Clipboard from '$lib/forms/Clipboard.svelte';

	const settings: ShellPageSettings = {
		feature: 'Identity',
		name: 'Create Service Account',
		description: 'Create a new service account in the organization.',
		icon: 'mdi:account-service-outline'
	};

	let names = $derived(data.serviceAccounts.map((x) => x.metadata.name));

	let resource: Identity.ServiceAccountWrite = $state({
		metadata: {
			name: ''
		},
		spec: {
			groupIDs: []
		}
	});

	/* Cluster name must be valid, and it must be unique */
	let metadataValid = $state(false);

	let valid = $derived(metadataValid);

	let serviceAccount: Identity.ServiceAccountCreate | undefined = $state();

	function submit() {
		const parameters = {
			organizationID: data.organizationID,
			serviceAccountWrite: resource
		};

		Clients.identity()
			.apiV1OrganizationsOrganizationIDServiceaccountsPost(parameters)
			.then((v: Identity.ServiceAccountCreate) => (serviceAccount = v))
			.catch((e: Error) => Clients.error(e));
	}

	let groups = $derived(data.groups.map((x) => ({ label: x.metadata.name, value: x.metadata.id })));
</script>

<ShellPageHeader {settings} />
{#if serviceAccount}
	<ShellViewHeader metadata={serviceAccount.metadata} />

	<ShellSection title="Access Token">
		<p>
			<em>This token will only be shown once, so make a copy and keep it secure.</em>
		</p>
		<Clipboard id="access-token" value={serviceAccount.status.accessToken || ''} />
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
	<ShellMetadataSection metadata={resource.metadata} {names} bind:valid={metadataValid} />

	<ShellSection title="Access Control">
		<MultiSelect
			label="Select group access."
			hint="Groups associate users with projects and grant them permissions to create, view, edit and delete."
			options={groups}
			value={resource.spec.groupIDs}
			onValueChange={(e) => (resource.spec.groupIDs = e.value)}
		>
			{#snippet selected(value: string)}
				{data.groups.find((x) => x.metadata.id == value)?.metadata.name}
			{/snippet}
		</MultiSelect>
	</ShellSection>

	<div class="flex justify-between">
		<Button
			icon="mdi:cancel-bold"
			label="Cancel"
			class="preset-outlined-surface-600-400"
			href="/identity/serviceaccounts"
		/>
		<Button
			icon="mdi:tick"
			label="Create"
			class="preset-filled-primary-500"
			clicked={submit}
			disabled={!valid}
		/>
	</div>
{/if}
