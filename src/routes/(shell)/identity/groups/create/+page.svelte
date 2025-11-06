<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import * as Clients from '$lib/clients';
	import * as Identity from '$lib/openapi/identity';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import MultiSelect from '$lib/forms/MultiSelect.svelte';
	import Button from '$lib/forms/Button.svelte';

	const settings: ShellPageSettings = {
		feature: 'Identity',
		name: 'Create Group',
		description: 'Create a new group in the organization.',
		icon: 'mdi:account-group-outline'
	};

	let names = $derived(data.groups.map((x) => x.metadata.name));

	let resource: Identity.GroupWrite = $state({
		metadata: {
			name: ''
		},
		spec: {
			roleIDs: [],
			userIDs: [],
			serviceAccountIDs: []
		}
	});

	let metadataValid = $state(false);

	/* Cluster name must be valid, and it must be unique */
	let valid = $derived(metadataValid && resource.spec.roleIDs.length > 0);

	function submit() {
		const parameters = {
			organizationID: data.organizationID,
			groupWrite: resource
		};

		Clients.identity()
			.apiV1OrganizationsOrganizationIDGroupsPost(parameters)
			.then(() => window.location.assign('/identity/groups'))
			.catch((e: Error) => Clients.error(e));
	}

	let roles = $derived(data.roles.map((x) => ({ label: x.metadata.name, value: x.metadata.id })));

	let users = $derived(data.users.map((x) => ({ label: x.spec.subject, value: x.metadata.id })));

	let serviceAccounts = $derived(
		data.serviceAccounts.map((x) => ({ label: x.metadata.name, value: x.metadata.id }))
	);
</script>

<ShellPageHeader {settings} />

<ShellMetadataSection metadata={resource.metadata} {names} bind:valid={metadataValid} />

<ShellSection title="Roles">
	<MultiSelect
		label="Select roles for group members."
		hint="You must select at least one role."
		options={roles}
		value={resource.spec.roleIDs}
		onValueChange={(e) => (resource.spec.roleIDs = e.value)}
	>
		{#snippet selected(value: string)}
			{data.roles.find((x) => x.metadata.id == value)?.metadata.name}
		{/snippet}
	</MultiSelect>
</ShellSection>

<ShellSection title="Users">
	<MultiSelect
		label="Select group members."
		options={users}
		value={resource.spec.userIDs || []}
		onValueChange={(e) => (resource.spec.userIDs = e.value)}
	>
		{#snippet selected(value: string)}
			{data.users.find((x) => x.metadata.id == value)?.spec.subject}
		{/snippet}
	</MultiSelect>
</ShellSection>

<ShellSection title="Service Accounts">
	<MultiSelect
		label="Select group members."
		options={serviceAccounts}
		value={resource.spec.serviceAccountIDs}
		onValueChange={(e) => (resource.spec.serviceAccountIDs = e.value)}
	>
		{#snippet selected(value: string)}
			{data.serviceAccounts.find((x) => x.metadata.id == value)?.metadata.name}
		{/snippet}
	</MultiSelect>
</ShellSection>

<div class="flex justify-between">
	<Button
		icon="mdi:cancel-bold"
		label="Cancel"
		class="preset-outlined-surface-600-400"
		href="/identity/groups"
	/>
	<Button
		icon="mdi:tick"
		label="Create"
		class="preset-filled-primary-500"
		clicked={submit}
		disabled={!valid}
	/>
</div>
