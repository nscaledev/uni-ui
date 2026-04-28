<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	import * as Clients from '$lib/clients';
	import * as Identity from '$lib/openapi/identity';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import TextInput from '$lib/forms/TextInput.svelte';
	import Select from '$lib/forms/Select.svelte';
	import Button from '$lib/forms/Button.svelte';
	import * as Validation from '$lib/validation';
	let organization = $derived.by(() => {
		let org = $state(data.organization);
		return org;
	});
	let providerType = $derived.by(() => {
		const p = data.oauth2providers.find((x) => x.metadata.id == organization.spec.providerID);
		return p?.spec.type;
	});
	let metadataValid = $state(false);
	let domainValid = $state(false);
	let valid = $derived.by(() => {
		if (!metadataValid) return false;
		if (organization.spec.organizationType === Identity.OrganizationType.Domain && !domainValid)
			return false;
		return true;
	});
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
			bind:valid={metadataValid}
		/>
	</ShellSection>
	<ShellSection title="Authentication Type">
		<Select
			label="Select your organization type."
			hint="Domain authentication routes users by email to a custom OIDC provider. Adhoc authentication lets users choose a provider manually."
			bind:value={organization.spec.organizationType}
		>
			{#each Object.entries(Identity.OrganizationType) as [symbol, value]}
				<option {value}>{symbol}</option>
			{/each}
		</Select>
	</ShellSection>
	{#if organization.spec.organizationType === Identity.OrganizationType.Domain}
		<ShellSection title="Email Domain">
			<TextInput
				label="Your email domain."
				hint="Add a DNS TXT record unikorn-site-verification to your root domain to verify ownership."
				placeholder="acme.corp"
				validators={[Validation.stringSet]}
				bind:value={organization.spec.domain}
				bind:valid={domainValid}
			/>
		</ShellSection>
		<ShellSection title="Identity Provider">
			<Select
				label="Provider scope."
				hint="Global uses predefined providers (Google, Microsoft). Organization lets you define your own."
				bind:value={organization.spec.providerScope}
			>
				{#each Object.entries(Identity.ProviderScope) as [symbol, value]}
					<option {value}>{symbol}</option>
				{/each}
			</Select>
			{#if organization.spec.providerScope === Identity.ProviderScope.Global}
				<Select label="Identity provider." bind:value={organization.spec.providerID}>
					{#each data.oauth2providers as p}<option value={p.metadata.id}
							>{p.metadata.description}</option
						>{/each}
				</Select>
				{#if providerType === Identity.Oauth2ProviderType.Google}
					<TextInput
						label="Google customer ID."
						hint="Obtain this from the Google admin console."
						placeholder="x83hRso7"
						bind:value={organization.spec.googleCustomerID}
					/>
				{/if}
			{:else}
				<Select label="Identity provider." bind:value={organization.spec.providerID}>
					{#each data.orgOauth2providers as p}<option value={p.metadata.id}
							>{p.metadata.name}</option
						>{/each}
				</Select>
			{/if}
		</ShellSection>
	{/if}
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
