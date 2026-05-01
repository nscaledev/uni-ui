<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	import * as Clients from '$lib/clients';
	import FormPage from '$lib/layouts/FormPage.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import NumberInput from '$lib/forms/NumberInput.svelte';
	// eslint-disable-next-line svelte/valid-compile
	let quotas = $state(structuredClone(data.quotas));
	function submit() {
		Clients.identity()
			.apiV1OrganizationsOrganizationIDQuotasPut({
				organizationID: data.organizationID,
				quotasWrite: quotas
			})
			.catch((e: Error) => Clients.error(e));
	}
</script>

<FormPage
	breadcrumb={[{ label: 'Quotas' }]}
	cancelHref="/identity/quotas"
	submitLabel="Update"
	description="Manage resource quotas for the organization."
	onSubmit={submit}
	valid={true}
>
	{#snippet form()}
		<ShellSection title="Resource Limits">
			{#each quotas.quotas as quota}
				<NumberInput
					label={quota.displayName}
					hint={quota.description}
					bind:value={quota.quantity}
				/>
			{/each}
		</ShellSection>
	{/snippet}
</FormPage>
