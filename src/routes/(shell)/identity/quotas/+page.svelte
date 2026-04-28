<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	import * as Clients from '$lib/clients';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import NumberInput from '$lib/forms/NumberInput.svelte';
	import Button from '$lib/forms/Button.svelte';
	let quotas = $derived.by(() => {
		let q = $state(data.quotas);
		return q;
	});
	function submit() {
		Clients.identity()
			.apiV1OrganizationsOrganizationIDQuotasPut({
				organizationID: data.organizationID,
				quotasWrite: quotas
			})
			.catch((e: Error) => Clients.error(e));
	}
</script>

<div class="settings-page">
	<header class="settings-page__header">
		<h1 class="settings-page__title">Quotas</h1>
		<p class="settings-page__desc">Manage resource quotas for the organization.</p>
	</header>
	<ShellSection title="Resource Limits">
		{#each quotas.quotas as quota}
			<NumberInput label={quota.displayName} hint={quota.description} bind:value={quota.quantity} />
		{/each}
	</ShellSection>
	<div class="settings-page__footer">
		<Button icon="check" label="Update" class="btn--primary" clicked={submit} />
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
