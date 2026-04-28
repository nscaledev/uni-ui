<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	import * as Clients from '$lib/clients';
	import * as Compute from '$lib/openapi/compute';
	import FormPage from '$lib/layouts/FormPage.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ShellMetadataItem from '$lib/layouts/ShellMetadataItem.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import RichSelect from '$lib/forms/RichSelect.svelte';
	import MultiSelect from '$lib/forms/MultiSelect.svelte';
	import Switch from '$lib/forms/Switch.svelte';
	import InputChips from '$lib/forms/InputChips.svelte';
	import Flavor from '$lib/Flavor.svelte';
	import Image from '$lib/Image.svelte';
	let resource = $derived.by(() => {
		let instance = $state(data.instance);
		return instance;
	});
	function initSecurityGroups() {
		return data.instance.spec.networking?.securityGroups || [];
	}
	function initPublicIP() {
		return data.instance.spec.networking?.publicIP || false;
	}
	function initAllowedSourceAddresses() {
		return data.instance.spec.networking?.allowedSourceAddresses || [];
	}
	let securityGroups: Array<string> = $state(initSecurityGroups());
	let publicIP = $state(initPublicIP());
	let allowedSourceAddresses: Array<string> = $state(initAllowedSourceAddresses());
	let flavors = $derived(
		data.flavors.filter((x) => data.images.some((y) => x.spec.disk >= y.spec.sizeGiB))
	);
	$effect.pre(() => {
		resource.spec.flavorId = flavors[0].metadata.id;
	});
	function lookupFlavor(id: string): Compute.Flavor {
		return flavors.find((x) => x.metadata.id == id) as Compute.Flavor;
	}
	let images = $derived(
		data.images.filter((x) => x.spec.sizeGiB <= lookupFlavor(resource.spec.flavorId).spec.disk)
	);
	function lookupImage(id: string): Compute.Image {
		return images.find((x) => x.metadata.id == id) as Compute.Image;
	}
	$effect.pre(() => {
		if (images.find((x) => x.metadata.id == resource.spec.imageId)) return;
		resource.spec.imageId = images.length ? images[0].metadata.id : '';
	});
	let metadataValid = $state(false);
	let valid = $derived(metadataValid && !!resource.spec.flavorId && !!resource.spec.imageId);
	function submit() {
		resource.spec.networking = {};
		if (securityGroups.length) resource.spec.networking.securityGroups = securityGroups;
		if (publicIP) resource.spec.networking.publicIP = publicIP;
		if (allowedSourceAddresses.length)
			resource.spec.networking.allowedSourceAddresses = allowedSourceAddresses;
		Clients.compute()
			.apiV2InstancesInstanceIDPut({ instanceID: resource.metadata.id, instanceUpdate: resource })
			.then(() => window.location.assign('/compute/instances'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<FormPage
	breadcrumb={[
		{ label: 'Compute Instances', href: '/compute/instances' },
		{ label: resource.metadata.name }
	]}
	cancelHref="/compute/instances"
	submitLabel="Save Changes"
	onSubmit={submit}
	{valid}
>
	{#snippet form()}
		<ShellMetadataSection
			metadata={resource.metadata}
			names={data.names}
			bind:valid={metadataValid}
		/>
		<ShellSection title="Topology">
			<RichSelect
				value={resource.spec.flavorId}
				onValueChange={(e) => (resource.spec.flavorId = e.value)}
				options={flavors.map((x) => x.metadata.id)}
				label="Choose an instance flavor."
				hint="CPU, GPU and memory resources allocated to the instance."
			>
				{#snippet contents(id: string)}<Flavor flavor={lookupFlavor(id)} />{/snippet}
			</RichSelect>
			<RichSelect
				value={resource.spec.imageId}
				onValueChange={(e) => (resource.spec.imageId = e.value)}
				options={images.map((x) => x.metadata.id)}
				label="Choose an instance image."
				hint="Operating system image for the instance."
			>
				{#snippet contents(id: string)}<Image image={lookupImage(id)} />{/snippet}
			</RichSelect>
		</ShellSection>
		<ShellSection title="Networking">
			<MultiSelect
				label="Security groups"
				hint="Security groups to apply to the instance."
				value={securityGroups}
				onValueChange={(e) => (securityGroups = e.value)}
				options={data.securityGroups.map((x) => ({ value: x.metadata.id, label: x.metadata.name }))}
			>
				{#snippet selected(id: string)}{data.securityGroups.find((x) => x.metadata.id == id)
						?.metadata.name}{/snippet}
			</MultiSelect>
			<Switch
				name="public-ip"
				label="Public IP"
				hint="Allocates a public IP so the instance can be reached on the internet."
				initial={publicIP}
				onCheckedChange={(e) => (publicIP = e.checked)}
			/>
			<InputChips
				name="allowed-source-addresses"
				label="Allowed source addresses"
				hint="Additional prefixes allowed to egress."
				bind:value={allowedSourceAddresses}
			/>
		</ShellSection>
	{/snippet}
</FormPage>
