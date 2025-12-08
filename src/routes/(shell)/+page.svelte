<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import { ProgressRing } from '@skeletonlabs/skeleton-svelte';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';

	const settings: ShellPageSettings = {
		feature: 'None',
		name: 'Dashboard',
		description: 'Summary of your resources.',
		icon: 'mdi:gauge'
	};
</script>

<ShellPageHeader {settings}></ShellPageHeader>
<ShellSection title="Resource Utilization">
	<div class="flex flex-col lg:grid lg:grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-4">
		{#each data.quotas.quotas as quota}
			<div
				class="flex flex-col gap-4 card bg-surface-50-950 border border-surface-200-800 shadow p-4"
			>
				<div class="flex flex-col gap-2">
					<div class="h4">{quota.displayName}</div>
					<div class="italic text-sm text-surface-700-300">{quota.description}</div>
				</div>
				<div class="flex items-center gap-4">
					<!-- the default is to treat the value as a pencentage -->
					<ProgressRing
						value={Math.round(quota.quantity <= 0 ? 0 : (quota.used / quota.quantity) * 100)}
						showLabel
						trackStroke="stroke-primary-500/20"
						strokeWidth="0.75rem"
						labelFontSize={32}
					></ProgressRing>

					<div class="grid grid-cols-[auto_auto] gap-x-4">
						<div class="font-bold">Total</div>
						<div>{quota.quantity}</div>
						<div class="font-bold">Used</div>
						<div>{quota.used}</div>
						<div class="font-bold">Free</div>
						<div>{quota.free}</div>
						<div class="contents text-surface-700-300">
							<div class="font-bold">Committed</div>
							<div>{quota.committed}</div>
							<div class="font-bold">Reserved</div>
							<div>{quota.reserved}</div>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</ShellSection>
