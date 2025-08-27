<script lang="ts">
	import * as Kubernetes from '$lib/openapi/kubernetes';

	import * as Formatters from '$lib/formatters';
	import * as Validation from '$lib/validation';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import TextInput from '$lib/forms/TextInput.svelte';
	import Select from '$lib/forms/Select.svelte';
	import RangeSlider from '$lib/forms/RangeSlider.svelte';
	import SelectNew from '$lib/forms/SelectNew.svelte';
	import Flavor from '$lib/Flavor.svelte';

	interface Props {
		/* The pool should be bound to expose the built configuration */
		pool: Kubernetes.VirtualKubernetesClusterWorkloadPool;
		/* Whether the configuration is valid */
		valid: boolean;
		/* Flavors allows the pool type to be populated */
		flavors: Array<Kubernetes.Flavor>;
	}

	let { pool = $bindable(), valid = $bindable(), flavors }: Props = $props();

	function updateFlavors(flavors: Array<Kubernetes.Flavor>): void {
		if (!flavors || flavors.find((x) => x.metadata.id == pool.flavorId)) return;
		pool.flavorId = flavors[0].metadata.id;
	}

	$effect.pre(() => {
		updateFlavors(flavors);
	});

	$effect.pre(() => {
		valid = Validation.kubernetesLabelValueValid(pool.name);
	});

	function lookupFlavor(id: string): Kubernetes.Flavor {
		return flavors.find((x) => x.metadata.id == id) as Kubernetes.Flavor;
	}
</script>

<ShellSection title="Pool Metadata">
	<TextInput
		label="Choose a name for your workload pool."
		hint={Validation.kubernetesLabelValueHint}
		validators={Validation.GetKubernetesLabelValueValidators([])}
		bind:value={pool.name}
		bind:valid
	/>
</ShellSection>

<ShellSection title="Pool Topology">
	{#if flavors && pool.flavorId}
		<SelectNew
			value={pool.flavorId}
			options={flavors.map((x) => x.metadata.id)}
			onValueChange={(e) => (pool.flavorId = e.value)}
			label="Choose a pool type."
			hint="Allows the selection of the pool's available resources to be used by workloads per pool
			member. This includes CPU, GPU and memory."
		>
			{#snippet contents(id: string)}
				<Flavor flavor={lookupFlavor(id)} />
			{/snippet}
		</SelectNew>
	{/if}

	{#if pool.replicas !== null}
		<RangeSlider
			name="size"
			label="Select the minimum number of replicas."
			min={1}
			max={100}
			step={1}
			value={[pool.replicas]}
			onValueChange={(e) => (pool.replicas = e.value[0])}
		/>
	{/if}
</ShellSection>
