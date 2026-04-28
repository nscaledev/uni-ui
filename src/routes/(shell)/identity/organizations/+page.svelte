<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import * as Clients from '$lib/clients';
	import * as Identity from '$lib/openapi/identity';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';

	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellViewHeader from '$lib/layouts/ShellViewHeader.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import TextInput from '$lib/forms/TextInput.svelte';
	import Select from '$lib/forms/Select.svelte';
	import Button from '$lib/forms/Button.svelte';
	import * as Validation from '$lib/validation';

	const settings: ShellPageSettings = {
		feature: 'Identity',
		name: 'View/Update Organization',
		description: 'Manage your organization.',
		icon: 'mdi:business'
	};

	let organization = $derived.by(() => {
		let organization = $state(data.organization);
		return organization;
	});

	function submit() {
		// Update the organization.
		const parameters = {
			organizationID: data.organizationID,
			organizationWrite: organization
		};

		Clients.identity()
			.apiV1OrganizationsOrganizationIDPut(parameters)
			.catch((e: Error) => Clients.error(e));
	}

	let providerType = $derived.by(() => {
		const provider = data.oauth2providers.find(
			(x) => x.metadata.id == organization.spec.providerID
		);
		if (!provider) return;

		return provider.spec.type;
	});

	let metadataValid: boolean = $state(false);
	let domainValid: boolean = $state(false);

	let valid: boolean = $derived.by(() => {
		if (!metadataValid) return false;
		if (organization.spec.organizationType == Identity.OrganizationType.Domain) {
			if (!domainValid) return false;
		}
		return true;
	});
</script>

<ShellPageHeader {settings} />
<ShellViewHeader metadata={organization.metadata} />
<ShellMetadataSection metadata={organization.metadata} names={[]} bind:valid={metadataValid} />

<ShellSection title="Authentication Type">
	<Select
		label="Select your organization type."
		hint="When domain authentication is selected, users will
                                login with an email address, and be routed to the correct identity provider for your
                                organization. Using this option allows the use of custom OIDC servers for authentication,
                                and mapping of groups from your identity provider to native RBAC groups. When adhoc
                                authentication is selected, users will login by selected their generic provider explicitly e.g.
				Google or Microsoft, and must be manually added to groups."
		bind:value={organization.spec.organizationType}
	>
		{#each Object.entries(Identity.OrganizationType) as [symbol, value]}
			<option {value}>{symbol}</option>
		{/each}
	</Select>
</ShellSection>

{#if organization.spec.organizationType == Identity.OrganizationType.Domain}
	<ShellSection title="Email Domain">
		<TextInput
			label="Your email domain."
			hint="To ensure you own the domain we require you to update
					your DNS server with a TXT record unikorn-site-verification to your root domain."
			placeholder="acme.corp"
			validators={[Validation.stringSet]}
			bind:value={organization.spec.domain}
			bind:valid={domainValid}
		/>
	</ShellSection>

	<ShellSection title="Identity Provider">
		<Select
			label="Identity provider type."
			hint="Selecting global enables the use of predefined globally
                                        available identity providers such as Google or Microsoft. Selecting organization allows
					you to define your own identity provider for the organization."
			bind:value={organization.spec.providerScope}
		>
			{#each Object.entries(Identity.ProviderScope) as [symbol, value]}
				<option {value}>{symbol}</option>
			{/each}
		</Select>

		{#if organization.spec.providerScope == Identity.ProviderScope.Global}
			<Select label="Identity provider to use." bind:value={organization.spec.providerID}>
				{#each data.oauth2providers as p}
					<option value={p.metadata.id}>{p.metadata.description}</option>
				{/each}
			</Select>

			{#if providerType == Identity.Oauth2ProviderType.Google}
				<TextInput
					label="Your Google customer ID."
					hint="This can be obtained from the Google admin console."
					placeholder="x83hRso7"
					bind:value={organization.spec.googleCustomerID}
				/>
			{/if}
		{:else}
			<!-- TODO: allow inline creation for better UX -->
			<label for="global-idp">Identity provider to use.</label>
			<select class="select" bind:value={organization.spec.providerID}>
				{#each data.orgOauth2providers as p}
					<option value={p.metadata.id}>{p.metadata.name}</option>
				{/each}
			</select>
		{/if}
	</ShellSection>
{/if}

<div class="flex">
	<Button
		icon="check"
		label="Update"
		class="preset-filled-primary-500"
		clicked={submit}
		disabled={!valid}
	/>
</div>
