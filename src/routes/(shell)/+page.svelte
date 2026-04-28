<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import ProgressRing from '$lib/primitives/ProgressRing.svelte';
	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';

	const settings: ShellPageSettings = {
		feature: 'None',
		name: 'Dashboard',
		description: 'Summary of your resources.',
		icon: 'dashboard'
	};
</script>

<ShellPageHeader {settings}></ShellPageHeader>
<ShellSection title="Resource Utilization">
	<div class="quota-grid">
		{#each data.quotas.quotas as quota}
			<div class="quota-card">
				<div class="quota-card__header">
					<div class="quota-card__name">{quota.displayName}</div>
					<div class="quota-card__desc">{quota.description}</div>
				</div>
				<div class="quota-card__body">
					<ProgressRing
						value={Math.round(quota.quantity <= 0 ? 0 : (quota.used / quota.quantity) * 100)}
						size={80}
						showLabel
					/>
					<div class="quota-stats">
						<div class="quota-stats__row"><span>Total</span><span>{quota.quantity}</span></div>
						<div class="quota-stats__row"><span>Used</span><span>{quota.used}</span></div>
						<div class="quota-stats__row"><span>Free</span><span>{quota.free}</span></div>
						<div class="quota-stats__row quota-stats__row--muted">
							<span>Committed</span><span>{quota.committed}</span>
						</div>
						<div class="quota-stats__row quota-stats__row--muted">
							<span>Reserved</span><span>{quota.reserved}</span>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</ShellSection>

<style>
	.quota-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 12px;
	}

	.quota-card {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 16px;
		background: var(--bg-2);
		border: 1px solid var(--line);
		border-radius: var(--r-md);
	}

	.quota-card__name {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-1);
	}

	.quota-card__desc {
		font-size: 12px;
		color: var(--text-3);
		margin-top: 2px;
		font-style: italic;
	}

	.quota-card__body {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.quota-stats {
		display: grid;
		grid-template-columns: auto auto;
		gap: 2px 16px;
		font-size: 13px;
	}

	.quota-stats__row {
		display: contents;
	}

	.quota-stats__row span:first-child {
		font-weight: 600;
		color: var(--text-2);
	}

	.quota-stats__row span:last-child {
		color: var(--text-1);
	}

	.quota-stats__row--muted span {
		color: var(--text-3);
	}
</style>
