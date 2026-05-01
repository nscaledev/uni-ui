<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	import * as Clients from '$lib/clients';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import TextInput from '$lib/forms/TextInput.svelte';
	import Button from '$lib/forms/Button.svelte';
	import * as Validation from '$lib/validation';
	let organization = $derived.by(() => {
		let org = $state(data.organization);
		return org;
	});
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

<div class="settings-page">
	<header class="settings-page__header">
		<h1 class="settings-page__title">Organization</h1>
		<p class="settings-page__desc">Manage your organization settings.</p>
	</header>
	<ShellSection title="Identity">
		<TextInput
			label="Organization name"
			bind:value={organization.metadata.name}
			validators={[Validation.stringSet]}
			bind:valid
		/>
	</ShellSection>
	<div class="settings-page__footer">
		<Button icon="check" label="Update" class="btn--primary" clicked={submit} disabled={!valid} />
	</div>
</div>

<style>
	.settings-page {
		display: flex;
		flex-direction: column;
		gap: 16px;
		max-width: 680px;
	}
	.settings-page__header {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.settings-page__title {
		font-size: 20px;
		font-weight: 600;
		color: var(--text-1);
	}
	.settings-page__desc {
		font-size: 13px;
		color: var(--text-3);
	}
	.settings-page__footer {
		display: flex;
		justify-content: flex-end;
		padding-top: 8px;
	}
</style>
