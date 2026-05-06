<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	import * as Clients from '$lib/clients';
	import * as Identity from '$lib/openapi/identity';
	import * as Validation from '$lib/validation';
	import FormPage from '$lib/layouts/FormPage.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import TextInput from '$lib/forms/TextInput.svelte';
	import MultiSelect from '$lib/forms/MultiSelect.svelte';
	let names = $derived(data.users.map((x) => x.spec.subject));
	let resource: Identity.UserWrite = $state({
		spec: { subject: '', state: Identity.UserState.Active, groupIDs: [] }
	});
	let subjectValid = $state(false);
	let valid = $derived(subjectValid && resource.spec.groupIDs.length > 0);
	let groups = $derived(data.groups.map((x) => ({ label: x.metadata.name, value: x.metadata.id })));
	function submit() {
		Clients.identity()
			.apiV1OrganizationsOrganizationIDUsersPost({
				organizationID: data.organizationID,
				userWrite: resource
			})
			.then(() => window.location.assign('/identity/users'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<FormPage
	breadcrumb={[{ label: 'Users', href: '/identity/users' }, { label: 'Create' }]}
	cancelHref="/identity/users"
	submitLabel="Create User"
	description="Invite a user to your organization."
	onSubmit={submit}
	{valid}
>
	{#snippet form()}
		<ShellSection title="User Information">
			<TextInput
				bind:value={resource.spec.subject}
				label="Email address."
				hint="User's canonical email address. Aliases will not work."
				validators={[Validation.stringSet, (name: string) => Validation.unique(name, names)]}
				bind:valid={subjectValid}
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
				{#snippet selected(value: string)}{data.groups.find((x) => x.metadata.id == value)?.metadata
						.name}{/snippet}
			</MultiSelect>
		</ShellSection>
	{/snippet}
</FormPage>
