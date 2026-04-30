<script lang="ts">
	import * as Region from '$lib/openapi/region';

	interface Props {
		flavor: Region.Flavor | undefined;
	}

	let { flavor }: Props = $props();
</script>

{#if flavor}
	<span class="flavor">
		<span class="k">CPU</span>
		{flavor.spec.cpus} core
		<span class="sep">·</span>
		<span class="k">RAM</span>
		{flavor.spec.memory} GiB
		<span class="sep">·</span>
		<span class="k">Disk</span>
		{flavor.spec.disk} GiB
		{#if flavor.spec.gpu}
			<span class="sep">·</span>
			<span class="k">GPU</span>
			{flavor.spec.gpu.physicalCount}× {flavor.spec.gpu.model} · {flavor.spec.gpu.logicalCount} logical
			· {flavor.spec.gpu.memory} GiB
		{/if}
	</span>
{/if}

<style>
	.flavor {
		font-size: 12px;
		color: var(--text-1);
	}

	.k {
		color: var(--text-3);
		font-weight: 500;
		margin-right: 4px;
	}

	.sep {
		color: var(--text-4);
		margin: 0 4px;
	}
</style>
