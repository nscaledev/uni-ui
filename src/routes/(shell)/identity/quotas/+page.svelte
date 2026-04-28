<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import * as Clients from '$lib/clients';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import NumberInput from '$lib/forms/NumberInput.svelte';
	import Button from '$lib/forms/Button.svelte';

	const settings: ShellPageSettings = {
		feature: 'Identity',
		name: 'Manage Quotas',
		description: 'Manage quotas for the organization.',
		icon: 'dashboard'
	};

	let quotas = $derived.by(() => {
		let quotas = $state(data.quotas);
		return quotas;
	});

	function submit() {
		const parameters = {
			organizationID: data.organizationID,
			quotasWrite: quotas
		};

		Clients.identity()
			.apiV1OrganizationsOrganizationIDQuotasPut(parameters)
			.catch((e: Error) => Clients.error(e));
	}
</script>

<ShellPageHeader {settings} />
<ShellSection title="Quotas">
	{#each quotas.quotas as quota}
		<NumberInput label={quota.displayName} hint={quota.description} bind:value={quota.quantity} />
	{/each}
</ShellSection>

<div class="flex justify-end">
	<Button icon="check" label="Update" class="preset-filled-primary-500" clicked={submit} />
</div>
