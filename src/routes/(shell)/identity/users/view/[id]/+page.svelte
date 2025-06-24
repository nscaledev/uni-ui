<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';

	let { data }: { data: PageData } = $props();

	import * as Clients from '$lib/clients';
	import * as Identity from '$lib/openapi/identity';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellViewHeaderSimple from '$lib/layouts/ShellViewHeaderSimple.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import Select from '$lib/forms/Select.svelte';
	import MultiSelect from '$lib/forms/MultiSelect.svelte';
	import Button from '$lib/forms/Button.svelte';

	const settings: ShellPageSettings = {
		feature: 'Identity',
		name: 'View/Update User',
		description: 'Manage your user.',
		icon: 'mdi:user-outline'
	};

	// Once we know the users, select the one we are viewing.
	let user = $derived.by(() => {
		let user = $state(data.user);
		return user;
	});

	function submit() {
		const parameters = {
			organizationID: data.organizationID,
			userID: $page.params.id,
			userWrite: user
		};

		Clients.identity()
			.apiV1OrganizationsOrganizationIDUsersUserIDPut(parameters)
			.then(() => window.location.assign('/identity/users'))
			.catch((e: Error) => Clients.error(e));
	}

	let groups = $derived(data.groups.map((x) => ({ label: x.metadata.name, value: x.metadata.id })));
</script>

<ShellPageHeader {settings} />
<ShellViewHeaderSimple name={user.spec.subject} />

<ShellSection title="Access Control">
	<Select
		label="Account State"
		hint="Active users can login and do things, other states don't allow login but retail group memberships."
		disabled={user.spec.state == Identity.UserState.Pending}
		bind:value={user.spec.state}
	>
		<option value={Identity.UserState.Active}>Active</option>
		{#if user.spec.state == Identity.UserState.Pending}
			<option value={Identity.UserState.Pending}>Pending</option>
		{/if}
		<option value={Identity.UserState.Suspended}>Suspended</option>
	</Select>

	<MultiSelect
		label="Select group access."
		hint="Groups associate users with users and grant them permissions to create, view, edit and delete."
		options={groups}
		value={user.spec.groupIDs}
		onValueChange={(e) => (user.spec.groupIDs = e.value)}
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
		href="/identity/users"
	/>
	<Button icon="mdi:tick" label="Update" class="preset-filled-primary-500" clicked={submit} />
</div>
