<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

	import * as Clients from '$lib/clients';
	import * as Compute from '$lib/openapi/compute';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import SelectNew from '$lib/forms/SelectNew.svelte';
	import MultiSelect from '$lib/forms/MultiSelect.svelte';
	import Switch from '$lib/forms/Switch.svelte';
	import InputChips from '$lib/forms/InputChips.svelte';
	import Button from '$lib/forms/Button.svelte';
	import Flavor from '$lib/Flavor.svelte';
	import Image from '$lib/Image.svelte';

	const settings: ShellPageSettings = {
		feature: 'Infrastructure',
		name: 'Create Compute Instance',
		description: 'Create and deploy a new compute instance.',
		icon: 'mdi:server-network-outline'
	};

	let instances = $derived(data.networks.filter((x) => x.metadata.id == data.networkID));
	let names = $derived((instances || []).map((x) => x.metadata.name));

	let resource: Compute.InstanceCreate = $state({
		metadata: {
			name: uniqueNamesGenerator({
				dictionaries: [adjectives, animals],
				separator: '-',
				length: 2
			})
		},
		spec: {
			organizationId: data.organizationID,
			projectId: data.projectID,
			networkId: data.networkID,
			flavorId: '',
			imageId: ''
		}
	});

	let securityGroups: Array<string> = $state([]);
	let publicIP: boolean = $state(true);
	let allowedSourceAddresses: Array<string> = $state([]);

	// A flavor can only be used if there is a compatible image.
	let flavors = $derived(
		data.flavors.filter((x) => data.images.some((y) => x.spec.disk >= y.spec.sizeGiB))
	);

	$effect.pre(() => {
		resource.spec.flavorId = flavors[0].metadata.id;
	});

	function lookupFlavor(id: string): Compute.Flavor {
		return flavors.find((x) => x.metadata.id == id) as Compute.Flavor;
	}

	// Images that can be used depend on the flavor selected.
	let images = $derived(
		data.images.filter((x) => x.spec.sizeGiB <= lookupFlavor(resource.spec.flavorId).spec.disk)
	);

	function lookupImage(id: string): Compute.Image {
		return images.find((x) => x.metadata.id == id) as Compute.Image;
	}

	$effect.pre(() => {
		if (images.find((x) => x.metadata.id == resource.spec.imageId)) {
			return;
		}

		resource.spec.imageId = images.length ? images[0].metadata.id : '';
	});

	let metadataValid = $state(false);

	function submit() {
		if (securityGroups || publicIP || allowedSourceAddresses) {
			resource.spec.networking = {};

			if (securityGroups) {
				resource.spec.networking.securityGroups = securityGroups;
			}

			if (publicIP) {
				resource.spec.networking.publicIP = publicIP;
			}

			if (allowedSourceAddresses) {
				resource.spec.networking.allowedSourceAddresses = allowedSourceAddresses;
			}
		}

		const parameters = {
			instanceCreate: resource
		};

		Clients.compute()
			.apiV2InstancesPost(parameters)
			.then(() => window.location.assign('/compute/instances'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<ShellPageHeader {settings} />
<h2 class="h2">Basic Configuration</h2>

<ShellMetadataSection metadata={resource.metadata} {names} bind:valid={metadataValid} />

<ShellSection title="Topology">
	<SelectNew
		value={resource.spec.flavorId}
		onValueChange={(e) => (resource.spec.flavorId = e.value)}
		options={flavors.map((x) => x.metadata.id)}
		label="Choose an instance flavor."
		hint="Allows selection of the instance's vailable resources to be used by workloads per pool
	member. This includes CPU, GPU and memory."
	>
		{#snippet contents(id: string)}
			<Flavor flavor={lookupFlavor(id)} />
		{/snippet}
	</SelectNew>

	<SelectNew
		value={resource.spec.imageId}
		onValueChange={(e) => (resource.spec.imageId = e.value)}
		options={images.map((x) => x.metadata.id)}
		label="Choose an instance image."
		hint="Allows the selection of the instances's operating system image."
	>
		{#snippet contents(id: string)}
			<Image image={lookupImage(id)} />
		{/snippet}
	</SelectNew>
</ShellSection>

<ShellSection title="Networking">
	<MultiSelect
		label="Security Groups"
		hint="Select security groups to apply to the instance.  By default all traffic can egress, none can ingress."
		value={securityGroups}
		onValueChange={(e) => (securityGroups = e.value)}
		options={data.securityGroups.map((x) => ({ value: x.metadata.id, label: x.metadata.name }))}
	>
		{#snippet selected(id: string)}
			{data.securityGroups.find((x) => x.metadata.id == id)?.metadata.name}
		{/snippet}
	</MultiSelect>

	<Switch
		name="public-ip"
		label="Public IP"
		hint="Allocates a public IP address so the instance can be reached on the Internet."
		initial={publicIP}
		onCheckedChange={(e) => (publicIP = e.checked)}
	/>

	<InputChips
		name="allowed-source-addresses"
		label="Allowed Source Addresses"
		hint="Instances will only allow traffic to egres from their onw IP address.  To enable NFV functionality (e.g. acting as a router), this specifies a set of additional prefixes that are allowed to egress."
		bind:value={allowedSourceAddresses}
	/>
</ShellSection>

<div class="flex justify-between">
	<Button
		icon="mdi:cancel-bold"
		label="Cancel"
		class="preset-outlined-surface-600-400"
		href="/network/networks"
	/>
	<Button
		icon="mdi:tick"
		label="Create"
		class="preset-filled-primary-500"
		clicked={submit}
		disabled={!metadataValid || !resource.spec.flavorId || !resource.spec.imageId}
	/>
</div>
