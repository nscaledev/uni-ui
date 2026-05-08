<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import prettyBytes from 'pretty-bytes';
	import Icon from '$lib/primitives/Icon.svelte';
	import ProgressRing from '$lib/primitives/ProgressRing.svelte';

	const KIND_ICONS: Record<string, string> = {
		'kubernetes:clusters': 'k8s',
		'compute:instances': 'cpu',
		'network:networks': 'network',
		'network:securitygroups': 'shield',
		'identity:projects': 'folder',
		'identity:users': 'user',
		'identity:groups': 'users',
		'identity:serviceaccounts': 'id',
		'region:sshcertificateauthorities': 'key'
	};

	function quotaIcon(kind: string): string {
		return KIND_ICONS[kind] ?? 'layers';
	}

	function formatQuotaValue(kind: string, value: number): string {
		if (kind === 'filestorage') return prettyBytes(value, { binary: true });
		return String(value);
	}
</script>

<div class="page-head">
	<div>
		<h1>Dashboard</h1>
		<div class="sub">Summary of your resources.</div>
	</div>
</div>

<div class="section-title">Resource Utilization</div>
<div class="util-grid">
	{#each data.quotas.quotas as quota}
		<div class="util-card">
			<div class="util-card__head">
				<div class="util-card__icon">
					<Icon name={quotaIcon(quota.kind)} size={14} />
				</div>
				<div>
					<div class="util-card__title">{quota.displayName}</div>
					<div class="util-card__sub">{quota.description}</div>
				</div>
			</div>
			<div class="util-card__body">
				<ProgressRing
					value={Math.round(quota.quantity <= 0 ? 0 : (quota.used / quota.quantity) * 100)}
					size={80}
					showLabel
				/>
				<dl class="util-card__grid">
					<dt>Total</dt>
					<dd>{formatQuotaValue(quota.kind, quota.quantity)}</dd>
					<dt>Used</dt>
					<dd>{formatQuotaValue(quota.kind, quota.used)}</dd>
					<dt class="free">Free</dt>
					<dd class="free">{formatQuotaValue(quota.kind, quota.free)}</dd>
					<dt>Committed</dt>
					<dd>{formatQuotaValue(quota.kind, quota.committed)}</dd>
					<dt>Reserved</dt>
					<dd>{formatQuotaValue(quota.kind, quota.reserved)}</dd>
				</dl>
			</div>
		</div>
	{/each}
</div>

<style>
	.free {
		color: var(--accent);
	}
</style>
