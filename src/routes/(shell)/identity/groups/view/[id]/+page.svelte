<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';

	let { data }: { data: PageData } = $props();

	import * as Clients from '$lib/clients';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellViewHeader from '$lib/layouts/ShellViewHeader.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import MultiSelect from '$lib/forms/MultiSelect.svelte';
	import Button from '$lib/forms/Button.svelte';

	const settings: ShellPageSettings = {
		feature: 'Identity',
		name: 'View/Update Group',
		description: 'Manage your group membership.',
		icon: 'mdi:account-group-outline'
	};

	let group = $derived.by(() => {
		let group = $state(data.group);
		return group;
	});

	let names: Array<string> = $derived(
		data.groups.filter((x) => x.metadata.id != $page.params.id).map((x) => x.metadata.name)
	);

	let metadataValid = $state(false);

	let valid = $derived(metadataValid && group?.spec.roleIDs.length != 0);

	function submit() {
		const parameters = {
			organizationID: data.organizationID,
			groupid: group.metadata.id,
			groupWrite: group
		};

		Clients.identity()
			.apiV1OrganizationsOrganizationIDGroupsGroupidPut(parameters)
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
<ShellViewHeader metadata={group.metadata} />
<ShellMetadataSection metadata={group.metadata} {names} bind:valid={metadataValid} />

<ShellSection title="Roles">
	<MultiSelect
		label="Select roles for group members."
		hint="You must select at least one role."
		options={roles}
		value={group.spec.roleIDs}
		onValueChange={(e) => (group.spec.roleIDs = e.value)}
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
		value={group.spec.userIDs}
		onValueChange={(e) => (group.spec.userIDs = e.value)}
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
		value={group.spec.serviceAccountIDs}
		onValueChange={(e) => (group.spec.serviceAccountIDs = e.value)}
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
		label="Update"
		class="preset-filled-primary-500"
		clicked={submit}
		disabled={!valid}
	/>
</div>
