<script lang="ts">
	import type { PageData } from './$types';
	import { browser } from '$app/environment';
	let { data }: { data: PageData } = $props();
	import * as Clients from '$lib/clients';
	import * as Identity from '$lib/openapi/identity';
	import * as Validation from '$lib/validation';
	import FormPage from '$lib/layouts/FormPage.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import TextInput from '$lib/forms/TextInput.svelte';
	import Clipboard from '$lib/forms/Clipboard.svelte';
	let names = $derived(data.oauth2providers.map((x) => x.metadata.name));
	let resource: Identity.Oauth2ProviderWrite = $state({
		metadata: { name: '' },
		spec: { issuer: '', clientID: '' }
	});
	let metadataValid = $state(false);
	let issuerValid = $state(false);
	let clientIdValid = $state(false);
	let clientSecretValid = $state(false);
	let valid = $derived(metadataValid && issuerValid && clientIdValid && clientSecretValid);
	const callback: string = browser
		? window.location.protocol + '//' + window.location.hostname + '/oauth2/callback'
		: '';
	function submit() {
		Clients.identity()
			.apiV1OrganizationsOrganizationIDOauth2providersPost({
				organizationID: data.organizationID,
				oauth2ProviderWrite: resource
			})
			.then(() => window.location.assign('/identity/oauth2providers'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<FormPage
	breadcrumb={[
		{ label: 'OAuth2 Providers', href: '/identity/oauth2providers' },
		{ label: 'Create' }
	]}
	cancelHref="/identity/oauth2providers"
	submitLabel="Create Provider"
	onSubmit={submit}
	{valid}
>
	{#snippet form()}
		<ShellMetadataSection metadata={resource.metadata} {names} bind:valid={metadataValid} />
		<ShellSection title="OAuth2 Settings">
			<p class="text-2 text-sm">
				Copy this callback address into your OIDC application before proceeding.
			</p>
			<Clipboard id="callback" value={callback} />
			<TextInput
				label="Issuer address"
				validators={[Validation.stringSet]}
				placeholder="https://identity.domain.com"
				bind:value={resource.spec.issuer}
				bind:valid={issuerValid}
			/>
			<TextInput
				label="Client ID"
				validators={[Validation.stringSet]}
				placeholder="73458e95-1d2c-481b-81e8-7225fd089060"
				bind:value={resource.spec.clientID}
				bind:valid={clientIdValid}
			/>
			<TextInput
				label="Client secret"
				validators={[Validation.stringSet]}
				placeholder="ooHovOvanogyisAvChuOv..."
				bind:value={resource.spec.clientSecret}
				bind:valid={clientSecretValid}
			/>
		</ShellSection>
	{/snippet}
</FormPage>
