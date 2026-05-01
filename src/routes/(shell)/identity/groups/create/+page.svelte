<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	import * as Clients from '$lib/clients';
	import * as Identity from '$lib/openapi/identity';
	import FormPage from '$lib/layouts/FormPage.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import MultiSelect from '$lib/forms/MultiSelect.svelte';
	let names = $derived(data.groups.map((x) => x.metadata.name));
	let resource: Identity.GroupWrite = $state({
		metadata: { name: '' },
		spec: { roleIDs: [], userIDs: [], serviceAccountIDs: [] }
	});
	let metadataValid = $state(false);
	let valid = $derived(metadataValid && resource.spec.roleIDs.length > 0);
	let roles = $derived(data.roles.map((x) => ({ label: x.metadata.name, value: x.metadata.id })));
	let users = $derived(data.users.map((x) => ({ label: x.spec.subject, value: x.metadata.id })));
	let serviceAccounts = $derived(
		data.serviceAccounts.map((x) => ({ label: x.metadata.name, value: x.metadata.id }))
	);
	function submit() {
		Clients.identity()
			.apiV1OrganizationsOrganizationIDGroupsPost({
				organizationID: data.organizationID,
				groupWrite: resource
			})
			.then(() => window.location.assign('/identity/groups'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<FormPage
	breadcrumb={[{ label: 'Groups', href: '/identity/groups' }, { label: 'Create' }]}
	cancelHref="/identity/groups"
	submitLabel="Create Group"
	description="Create a group to assign roles to users and service accounts."
	onSubmit={submit}
	{valid}
>
	{#snippet form()}
		<ShellMetadataSection metadata={resource.metadata} {names} bind:valid={metadataValid} />
		<ShellSection title="Roles">
			<MultiSelect
				label="Select roles for group members."
				hint="At least one role is required."
				options={roles}
				value={resource.spec.roleIDs}
				onValueChange={(e) => (resource.spec.roleIDs = e.value)}
			>
				{#snippet selected(value: string)}{data.roles.find((x) => x.metadata.id == value)?.metadata
						.name}{/snippet}
			</MultiSelect>
		</ShellSection>
		<ShellSection title="Users">
			<MultiSelect
				label="Users"
				hint="Human user accounts to add to this group."
				options={users}
				value={resource.spec.userIDs || []}
				onValueChange={(e) => (resource.spec.userIDs = e.value)}
			>
				{#snippet selected(value: string)}{data.users.find((x) => x.metadata.id == value)?.spec
						.subject}{/snippet}
			</MultiSelect>
		</ShellSection>
		<ShellSection title="Service Accounts">
			<MultiSelect
				label="Service accounts"
				hint="Machine accounts for programmatic access."
				options={serviceAccounts}
				value={resource.spec.serviceAccountIDs}
				onValueChange={(e) => (resource.spec.serviceAccountIDs = e.value)}
			>
				{#snippet selected(value: string)}{data.serviceAccounts.find((x) => x.metadata.id == value)
						?.metadata.name}{/snippet}
			</MultiSelect>
		</ShellSection>
	{/snippet}
</FormPage>
