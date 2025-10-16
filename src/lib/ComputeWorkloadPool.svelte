<script lang="ts">
	import type { Snippet } from 'svelte';

	import * as Compute from '$lib/openapi/compute';

	import * as Formatters from '$lib/formatters';
	import * as Validation from '$lib/validation';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import TextInput from '$lib/forms/TextInput.svelte';
	import Switch from '$lib/forms/Switch.svelte';
	import SelectNew from '$lib/forms/SelectNew.svelte';
	import RangeSlider from '$lib/forms/RangeSlider.svelte';
	import Select from '$lib/forms/Select.svelte';
	import InputChips from '$lib/forms/InputChips.svelte';
	import Flavor from '$lib/Flavor.svelte';
	import Image from '$lib/Image.svelte';
	import ComputeWorkloadPoolSecurityRule from '$lib/ComputeWorkloadPoolSecurityRule.svelte';

	interface Props {
		// The pool should be bound to expose the built configuration.
		pool: Compute.ComputeClusterWorkloadPool;
		// Whether the configuration is valid.
		valid: boolean;
		// Flavors allows the pool type to be populated.
		flavors: Array<Compute.Flavor>;
		// Images allows the pool operating system image to be populated.
		images: Array<Compute.Image>;
		// Firewall rule dialog.
		firewall: Snippet;
	}

	let { pool = $bindable(), valid = $bindable(), flavors, images, firewall }: Props = $props();

	function onPublicIPChange(e: { checked: boolean }) {
		if (e.checked) {
			pool.machine.publicIPAllocation = {
				enabled: true
			};
		} else {
			delete pool.machine.publicIPAllocation;
		}
	}

	// Select a flavor for the workload pool if one is not already set or it no longer exists.
	$effect.pre(() => {
		if (flavors.find((x) => x.metadata.id == pool.machine.flavorId)) return;

		pool.machine.flavorId = flavors[0].metadata.id;
	});

	// If a flavorID is selected, by the workload pool, extract that flavor.
	let flavor = $derived(flavors.find((x) => x.metadata.id == pool.machine.flavorId));

	function osKey(distro: Compute.OsDistro, variant: string | undefined, version: string): string {
		if (!variant) return distro + ':' + version;

		return distro + ':' + variant + ':' + version;
	}

	function imageKey(image: Compute.Image): string {
		return osKey(image.spec.os.distro, image.spec.os.variant, image.spec.os.version);
	}

	function selectorKey(selector: Compute.ImageSelector): string {
		return osKey(selector.distro, selector.variant, selector.version);
	}

	// initialImage sets the image as either that defined by the pool
	// or an aribtrary one from the image list.
	function initialImage(): string {
		if (pool.machine.image?.selector) {
			return selectorKey(pool.machine.image.selector);
		}

		return selectorKey(images[0].spec.os);
	}

	let image = $state(initialImage());

	// Create a mapping of operating system distribution (optionally variant) and version.
	let osVersions: Record<string, Compute.Image> = $derived.by(() => {
		let result: Record<string, Compute.Image> = {};

		for (const image of images) {
			const key = imageKey(image);

			if (key in result) continue;

			result[key] = image;
		}

		// If the current image is invalid, select and a new arbirary one.
		if (!(image in result)) {
			image = Object.keys(result)[0];
		}

		return result;
	});

	// When the image changes, update the pool.
	$effect.pre(() => {
		if (!osVersions || !(image in osVersions)) return;

		const i = osVersions[image];

		pool.machine.image = {
			selector: {
				distro: i.spec.os.distro,
				variant: i.spec.os.variant,
				version: i.spec.os.version
			}
		};
	});

	// Update whether persistent storage is allowed once the flavor ID is determined.
	let persistentStorageAllowed = $derived(flavor && !flavor.spec.baremetal);

	function persistentStorageChange(e: { checked: boolean }) {
		// Volumes cannot be used on baremetal nodes */
		if (!persistentStorageAllowed) {
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

	// Pool is valid if the name is.
	$effect.pre(() => {
		valid = Validation.kubernetesLabelValueValid(pool.name);
	});

	function newFirewallRule(): Compute.FirewallRule {
		return {
			direction: Compute.FirewallRuleDirectionEnum.Ingress,
			protocol: Compute.FirewallRuleProtocolEnum.Tcp,
			port: 0,
			prefixes: []
		};
	}

	let showRuleDefine: boolean = $state(false);

	let tempRule: Compute.FirewallRule = $state(newFirewallRule());

	let tempRuleValid: boolean = $state(false);

	function addFirewallRule() {
		tempRuleValid = false;
		tempRule = newFirewallRule();
		showRuleDefine = true;
	}

	function submitFirewallRule() {
		if (!showRuleDefine) return;

		if (!pool.machine.firewall) {
			pool.machine.firewall = [];
		}

		pool.machine.firewall.push(tempRule);
		pool.machine.firewall = pool.machine.firewall;

		showRuleDefine = false;
	}

	function deleteFirewallRule(index: number) {
		if (!pool.machine.firewall) return;

		pool.machine.firewall.splice(index, 1);
		pool.machine.firewall = pool.machine.firewall;
	}

	function lookupFlavor(id: string): Compute.Flavor {
		return flavors.find((x) => x.metadata.id == id) as Compute.Flavor;
	}

	let allowedAddressPairs: Array<string> = $state([]);

	$effect(() => {
		pool.machine.allowedAddressPairs = allowedAddressPairs.map((x) => {
			return { cidr: x } as Compute.AllowedAddressPair;
		});
	});
</script>

<div class="flex flex-col gap-8">
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
		{#if pool.machine.flavorId}
			<SelectNew
				value={pool.machine.flavorId}
				onValueChange={(e) => (pool.machine.flavorId = e.value)}
				options={flavors.map((x) => x.metadata.id)}
				label="Choose a pool type."
				hint="Allows the selection of the pool's available resources to be used by workloads per pool
			member. This includes CPU, GPU and memory."
			>
				{#snippet contents(id: string)}
					<Flavor flavor={lookupFlavor(id)} />
				{/snippet}
			</SelectNew>

			{#if persistentStorageAllowed}
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

		{#if osVersions}
			<SelectNew
				value={image}
				onValueChange={(e) => (image = e.value)}
				options={Object.keys(osVersions)}
				label="Choose an image ."
				hint="Allows the selection of the pool's operating system image per pool."
			>
				{#snippet contents(id: string)}
					<Image image={osVersions[id]} />
				{/snippet}
			</SelectNew>
		{/if}

		<RangeSlider
			name="size"
			label="Select the minimum number of replicas."
			min={1}
			max={100}
			step={1}
			value={[pool.machine.replicas]}
			onValueChange={(e) => (pool.machine.replicas = e.value[0])}
		/>

		<Switch
			name="public_ip"
			label="Enable Public Access."
			hint="Selecting this option allocates a public IP address to each node in the pool."
			initial={Boolean($state.snapshot(pool.machine.publicIPAllocation?.enabled))}
			onCheckedChange={onPublicIPChange}
		/>

		<InputChips
			name="allowed_address_pairs"
			label="Allowed Address Pairs"
			hint="A list of network prefixes that the server can send and receive e.g. acting as a router"
			bind:value={allowedAddressPairs}
		/>

		{@render firewall()}
	</ShellSection>
</div>
