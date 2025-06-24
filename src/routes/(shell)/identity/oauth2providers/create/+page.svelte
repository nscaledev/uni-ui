<script lang="ts">
	import type { PageData } from './$types';
	import { browser } from '$app/environment';

	let { data }: { data: PageData } = $props();

	import * as Clients from '$lib/clients';
	import * as Identity from '$lib/openapi/identity';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import TextInput from '$lib/forms/TextInput.svelte';
	import Clipboard from '$lib/forms/Clipboard.svelte';
	import Button from '$lib/forms/Button.svelte';
	import * as Validation from '$lib/validation';

	const settings: ShellPageSettings = {
		feature: 'Identity',
		name: 'Create OAuth2 Provider',
		description: 'Create a new oauth2 provider.',
		icon: 'mdi:key-outline'
	};

	let names = $derived(data.oauth2providers.map((x) => x.metadata.name));

	let resource: Identity.Oauth2ProviderWrite = $state({
		metadata: {
			name: ''
		},
		spec: {
			issuer: '',
			clientID: ''
		}
	});

	let metadataValid = $state(false);
	let issuerValid: boolean = $state(false);
	let clientIdValid: boolean = $state(false);
	let clientSecretValid: boolean = $state(false);

	let valid = $derived(metadataValid && issuerValid && clientIdValid && clientSecretValid);

	function submit() {
		const parameters = {
			organizationID: data.organizationID,
			oauth2ProviderWrite: resource
		};

		Clients.identity()
			.apiV1OrganizationsOrganizationIDOauth2providersPost(parameters)
			.then(() => window.location.assign('/identity/oauth2providers'))
			.catch((e: Error) => Clients.error(e));
	}

	var callback: string = browser
		? window.location.protocol + '://' + window.location.hostname + '/oauth2/callback'
		: '';
</script>

<ShellPageHeader {settings} />
<ShellMetadataSection metadata={resource.metadata} {names} bind:valid={metadataValid} />

<ShellSection title="OAuth2 Settings">
	<label for="callback"
		>Oauth2 callback address. This is used to configure your OIDC application with before continuing
		with the following fields.</label
	>
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
		placeholder="ooHovOvanogyisAvChuOvbyctoffOdloidKuAlsyemgosJias3twanechorjIdCo"
		bind:value={resource.spec.clientSecret}
		bind:valid={clientSecretValid}
	/>
</ShellSection>

<div class="flex justify-between">
	<Button
		icon="mdi:cancel-bold"
		label="Cancel"
		class="preset-outlined-surface-600-400"
		href="/identity/oauth2providers"
	/>
	<Button
		icon="mdi:tick"
		label="Create"
		class="preset-filled-primary-500"
		clicked={submit}
		disabled={!valid}
	/>
</div>
