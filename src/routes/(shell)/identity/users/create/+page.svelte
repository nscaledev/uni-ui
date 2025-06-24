<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import * as Clients from '$lib/clients';
	import * as Identity from '$lib/openapi/identity';
	import * as Validation from '$lib/validation';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import TextInput from '$lib/forms/TextInput.svelte';
	import MultiSelect from '$lib/forms/MultiSelect.svelte';
	import Button from '$lib/forms/Button.svelte';

	const settings: ShellPageSettings = {
		feature: 'Identity',
		name: 'Create User',
		description: 'Create a new user in the organization.',
		icon: 'mdi:user-outline'
	};

	let names = $derived(data.users.map((x) => x.spec.subject));

	let resource: Identity.UserWrite = $state({
		spec: {
			subject: '',
			state: Identity.UserState.Active,
			groupIDs: []
		}
	});

	/* Cluster name must be valid, and it must be unique */
	let usernameValid = $state(false);

	let valid = $derived(usernameValid && resource.spec.groupIDs.length > 0);

	function submit() {
		const parameters = {
			organizationID: data.organizationID,
			userWrite: resource
		};

		Clients.identity()
			.apiV1OrganizationsOrganizationIDUsersPost(parameters)
			.then(() => window.location.assign('/identity/users'))
			.catch((e: Error) => Clients.error(e));
	}

	let groups = $derived(data.groups.map((x) => ({ label: x.metadata.name, value: x.metadata.id })));
</script>

<ShellPageHeader {settings} />
<ShellSection title="User Information">
	<TextInput
		bind:value={resource.spec.subject}
		label="Email Address."
		hint="Users canonical email address, use of email aliases will not work."
		validators={[Validation.stringSet, (name: string) => Validation.unique(name, names)]}
		bind:valid={usernameValid}
	/>
</ShellSection>

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
		href="/identity/users"
	/>
	<Button
		icon="mdi:tick"
		label="Create"
		class="preset-filled-primary-500"
		clicked={submit}
		disabled={!valid}
	/>
</div>
