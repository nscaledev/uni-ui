<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	import * as Clients from '$lib/clients';
	import * as Identity from '$lib/openapi/identity';
	import FormPage from '$lib/layouts/FormPage.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import MultiSelect from '$lib/forms/MultiSelect.svelte';
	import Clipboard from '$lib/forms/Clipboard.svelte';
	import Button from '$lib/forms/Button.svelte';
	let names = $derived(data.serviceAccounts.map((x) => x.metadata.name));
	let resource: Identity.ServiceAccountWrite = $state({
		metadata: { name: '' },
		spec: { groupIDs: [] }
	});
	let metadataValid = $state(false);
	let valid = $derived(metadataValid);
	let groups = $derived(data.groups.map((x) => ({ label: x.metadata.name, value: x.metadata.id })));
	let serviceAccount: Identity.ServiceAccountCreate | undefined = $state();
	function submit() {
		Clients.identity()
			.apiV1OrganizationsOrganizationIDServiceaccountsPost({
				organizationID: data.organizationID,
				serviceAccountWrite: resource
			})
			.then((v: Identity.ServiceAccountCreate) => (serviceAccount = v))
			.catch((e: Error) => Clients.error(e));
	}
</script>

{#if serviceAccount}
	<nav class="breadcrumb" aria-label="Breadcrumb">
		<a href="/identity/serviceaccounts">Service Accounts</a>
		<span class="sep">/</span>
		<span>Token</span>
	</nav>
	<div class="form-layout form-layout--no-aside">
		<div class="form-main">
			<div class="form-section">
				<header><div class="form-section__title">Access Token</div></header>
				<p class="text-2 text-sm">
					This token will only be shown once — copy it now and store it securely.
				</p>
				<Clipboard id="access-token" value={serviceAccount.status.accessToken || ''} />
			</div>
		</div>
	</div>
	<div class="form-footer">
		<div style="flex:1"></div>
		<Button icon="check" label="Done" class="btn--primary" href="/identity/serviceaccounts" />
	</div>
{:else}
	<FormPage
		breadcrumb={[
			{ label: 'Service Accounts', href: '/identity/serviceaccounts' },
			{ label: 'Create' }
		]}
		cancelHref="/identity/serviceaccounts"
		submitLabel="Create Service Account"
		description="Create a machine account for automation and programmatic access."
		onSubmit={submit}
		{valid}
	>
		{#snippet form()}
			<ShellMetadataSection metadata={resource.metadata} {names} bind:valid={metadataValid} />
			<ShellSection title="Access Control">
				<MultiSelect
					label="Select group access."
					hint="Groups associate users with projects and grant them permissions to create, view, edit and delete."
					options={groups}
					value={resource.spec.groupIDs}
					onValueChange={(e) => (resource.spec.groupIDs = e.value)}
				>
					{#snippet selected(value: string)}{data.groups.find((x) => x.metadata.id == value)
							?.metadata.name}{/snippet}
				</MultiSelect>
			</ShellSection>
		{/snippet}
	</FormPage>
{/if}
