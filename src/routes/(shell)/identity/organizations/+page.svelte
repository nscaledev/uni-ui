<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	import * as Clients from '$lib/clients';
	import * as Validation from '$lib/validation';
	import FormPage from '$lib/layouts/FormPage.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import TextInput from '$lib/forms/TextInput.svelte';
	// eslint-disable-next-line svelte/valid-compile
	let organization = $state(structuredClone(data.organization));
	let valid = $state(false);
	function submit() {
		Clients.identity()
			.apiV1OrganizationsOrganizationIDPut({
				organizationID: data.organizationID,
				organizationWrite: organization
			})
			.catch((e: Error) => Clients.error(e));
	}
</script>

<FormPage
	breadcrumb={[{ label: 'Organization' }]}
	cancelHref="/identity/organizations"
	submitLabel="Update"
	description="Manage your organization settings."
	onSubmit={submit}
	{valid}
>
	{#snippet form()}
		<ShellSection title="Identity">
			<TextInput
				label="Organization name"
				bind:value={organization.metadata.name}
				validators={[Validation.stringSet]}
				bind:valid
			/>
		</ShellSection>
	{/snippet}
</FormPage>
