<script lang="ts">
	import * as Region from '$lib/openapi/region';

	interface Props {
		flavor: Region.Flavor | undefined;
	}

	let { flavor }: Props = $props();
</script>

{#if flavor}
	<dl class="attrs">
		<dt>CPU</dt>
		<dd>{flavor.spec.cpus} core</dd>
		<dt>RAM</dt>
		<dd>{flavor.spec.memory} GiB</dd>
		<dt>Disk</dt>
		<dd>{flavor.spec.disk} GiB</dd>
		{#if flavor.spec.gpu}
			<dt>GPU</dt>
			<dd>
				{flavor.spec.gpu.physicalCount}×
				{flavor.spec.gpu.model} · {flavor.spec.gpu.logicalCount} logical · {flavor.spec.gpu.memory} GiB
			</dd>
		{/if}
	</dl>
{/if}

<style>
	.attrs {
		display: grid;
		grid-template-columns: 36px minmax(0, 1fr);
		gap: 3px 10px;
		margin: 0;
		font-size: 12px;
	}

	.attrs dt {
		color: var(--text-3);
		font-weight: 500;
	}

	.attrs dd {
		margin: 0;
		color: var(--text-1);
	}
</style>
