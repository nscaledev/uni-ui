<script lang="ts">
	import * as Kubernetes from '$lib/openapi/kubernetes';

	import * as Formatters from '$lib/formatters';
	import * as Validation from '$lib/validation';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import TextInput from '$lib/forms/TextInput.svelte';
	import Switch from '$lib/forms/Switch.svelte';
	import Select from '$lib/forms/Select.svelte';
	import RangeSlider from '$lib/forms/RangeSlider.svelte';
	import SelectNew from '$lib/forms/SelectNew.svelte';
	import Flavor from '$lib/Flavor.svelte';

	interface Props {
		/* The pool should be bound to expose the built configuration */
		pool: Kubernetes.KubernetesClusterWorkloadPool;
		/* Whether the configuration is valid */
		valid: boolean;
		/* Flavors allows the pool type to be populated */
		flavors: Array<Kubernetes.Flavor>;
	}

	let { pool = $bindable(), valid = $bindable(), flavors }: Props = $props();

	function updateFlavors(flavors: Array<Kubernetes.Flavor>): void {
		if (!flavors || flavors.find((x) => x.metadata.id == pool.machine.flavorId)) return;
		pool.machine.flavorId = flavors[0].metadata.id;
	}

	$effect.pre(() => {
		updateFlavors(flavors);
	});

	/* Default to autoscaling with scale from zero */
	function autoscalingChange(e: { checked: boolean }) {
		if (e.checked && !pool.autoscaling) {
			pool.autoscaling = {
				minimumReplicas: 0
			};
		} else if (!e.checked) {
			delete pool.autoscaling;
		}
	}

	function persistentStorageChange(e: { checked: boolean }) {
		if (!pool.machine.flavorId) return;

		/* Volumes cannot be used on baremetal nodes */
		const allowed = !lookupFlavor(pool.machine.flavorId).spec.baremetal;
		if (!allowed) {
			if (pool.machine.disk) {
				delete pool.machine.disk;
			}

			return;
		}

		if (e.checked && !pool.machine.disk) {
			pool.machine.disk = {
				size: 50
			};
		} else if (!e.checked) {
			delete pool.machine.disk;
		}
	}

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
	{#if flavors && pool.machine.flavorId}
		<SelectNew
			value={pool.machine.flavorId}
			options={flavors.map((x) => x.metadata.id)}
			onValueChange={(e) => (pool.machine.flavorId = e.value)}
			label="Choose a pool type."
			hint="Allows the selection of the pool's available resources to be used by workloads per pool
			member. This includes CPU, GPU and memory."
		>
			{#snippet contents(id: string)}
				<Flavor flavor={lookupFlavor(id)} />
			{/snippet}
		</SelectNew>

		{#if !lookupFlavor(pool.machine.flavorId).spec.baremetal}
			<Switch
				name="persistent-storage"
				label="Enable persistent storage."
				hint="If not selected, the disk size will be
                fixed to that offered by the pool type, and will be ephemeral with higher performance. If
                selected, the disk will be network attached with higher availabilty and the option to change the
                size."
				initial={Boolean($state.snapshot(pool.machine.disk))}
				onCheckedChange={persistentStorageChange}
			/>

			{#if pool.machine.disk?.size}
				<RangeSlider
					name="storage-size"
					label="Select the disk size per machine."
					min={50}
					max={4000}
					step={50}
					formatter={Formatters.formatGB}
					value={[pool.machine.disk.size]}
					onValueChange={(e) => {
						if (pool.machine.disk) {
							pool.machine.disk.size = e.value[0];
						}
					}}
				/>
			{/if}
		{/if}
	{/if}

	<Switch
		name="autoscaling"
		label="Enable autoscaling."
		hint="This scaling enables the pool to grow, and shrink, depending on workload requirements. With
                automatic scaling you only pay for what you us, but there is an associated performance penalty
                when nodes are dynamically created and added to the cluster."
		initial={Boolean($state.snapshot(pool.autoscaling))}
		onCheckedChange={autoscalingChange}
	/>

	{#if pool.machine.replicas}
		{#if pool.autoscaling}
			<RangeSlider
				name="min-size"
				label="Select the number of replicas."
				hint="When the minimum is zero, the pool will not consume any resources when not in use. Otherwise, it will define a minimum number of members that must exist at any time,
                        providing resource that can be used immediately without waiting for automatic scaling."
				min={0}
				max={100}
				step={1}
				value={[pool.autoscaling.minimumReplicas, pool.machine.replicas]}
				onValueChange={(e) => {
					if (pool.autoscaling) {
						pool.autoscaling.minimumReplicas = e.value[0];
					}
					pool.machine.replicas = e.value[1];
				}}
			/>
		{:else}
			<RangeSlider
				name="size"
				label="Select the minimum number of replicas."
				min={1}
				max={100}
				step={1}
				value={[pool.machine.replicas]}
				onValueChange={(e) => (pool.machine.replicas = e.value[0])}
			/>
		{/if}
	{/if}
</ShellSection>
