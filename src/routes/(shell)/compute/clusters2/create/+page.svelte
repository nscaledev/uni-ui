<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

	import * as Clients from '$lib/clients';
	import * as Compute from '$lib/openapi/compute';
	import * as Validation from '$lib/validation';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import Stepper from '$lib/layouts/Stepper.svelte';
	import ResourceList from '$lib/layouts/ResourceList.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import SelectNew from '$lib/forms/SelectNew.svelte';
	import MultiSelect from '$lib/forms/MultiSelect.svelte';
	import Switch from '$lib/forms/Switch.svelte';
	import InputChips from '$lib/forms/InputChips.svelte';
	import TextInput from '$lib/forms/TextInput.svelte';
	import RangeSlider from '$lib/forms/RangeSlider.svelte';
	import Flavor from '$lib/Flavor.svelte';
	import Image from '$lib/Image.svelte';

	const settings: ShellPageSettings = {
		feature: 'Infrastructure',
		name: 'Create Compute Cluster',
		description: 'Create and deploy a new compute cluster.',
		icon: 'mdi:server-network-outline'
	};

	let clusters = $derived(data.clusters.filter((x) => x.status.networkId == data.networkID));
	let names = $derived((clusters || []).map((x) => x.metadata.name));

	let resource: Compute.ClusterV2Create = $state({
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
			pools: [
				{
					name: 'default',
					replicas: 1,
					flavorId: '',
					imageId: '',
					networking: {
						publicIP: true
					}
				}
			]
		}
	});

	let step: number = $state(0);

	// Step 1 requires the metadata to be valid and a version to have been selected.
	let metadataValid = $state(false);

	let step1valid: boolean = $derived.by(() => {
		if (step != 0) return true;

		if (!metadataValid) return false;

		return true;
	});

	// Step 2 requires a workload pool to be defined.
	let step2valid: boolean = $derived.by(() => {
		if (step != 1) return true;

		// If there is a workload pool active, it is potentially invalid.
		if (workloadPoolActive) return false;

		return true;
	});

	// Roll up the overall validity for the stepper to allow progress.
	let valid = $derived(step1valid && step2valid);

	function complete() {
		const parameters = {
			clusterV2Create: resource
		};

		Clients.compute()
			.apiV2ClustersPost(parameters)
			.then((v: Compute.ClusterV2Read) =>
				window.location.assign('/compute/clusters2/view/' + v.metadata.id)
			)
			.catch((e: Error) => Clients.error(e));
	}

	// A flavor can only be used if there is a compatible image.
	let flavors = $derived(
		data.flavors.filter((x) => data.images.some((y) => x.spec.disk >= y.spec.sizeGiB))
	);

	function lookupFlavor(flavorID: string): Compute.Flavor {
		return data.flavors.find((x) => x.metadata.id == flavorID) as Compute.Flavor;
	}

	// Images are selected for a pool once activated and we know the flavor ID.
	let images = $derived.by(() => {
		if (!flavorID) return [];

		return data.images.filter((x) => x.spec.sizeGiB <= lookupFlavor(flavorID).spec.disk);
	});

	function lookupImage(imageID: string): Compute.Image {
		return data.images.find((x) => x.metadata.id == imageID) as Compute.Image;
	}

	let name: string = $state('');
	let replicas: number = $state(1);
	let flavorID: string = $state('');
	let imageID: string = $state('');
	let securityGroups: Array<string> = $state([]);
	let publicIP: boolean = $state(false);
	let allowedSourceAddresses: Array<string> = $state([]);

	$effect.pre(() => {
		if (flavorID) return;

		flavorID = flavors.length ? flavors[0].metadata.id : '';
	});

	$effect.pre(() => {
		if (imageID) return;

		imageID = images.length ? images[0].metadata.id : '';
	});

	function workloadPoolAdd(initialName: string = ''): number {
		let pool: Compute.PoolV2 = {
			name: initialName,
			replicas: 1,
			flavorId: '',
			imageId: ''
		};

		resource.spec.pools.push(pool);

		return resource.spec.pools.length - 1;
	}

	$effect.pre(() => {
		if (!resource.spec.pools.length) workloadPoolAdd('default');
	});

	function workloadPoolRemove(index: number) {
		resource.spec.pools.splice(index, 1);
	}

	// When editing a pool, make a local copy of the firewall rule.
	function workloadPoolActivate(index: number) {
		if (!resource.spec.pools) return;

		const pool = resource.spec.pools[index];

		name = pool.name;
		replicas = pool.replicas;
		flavorID = pool.flavorId;
		imageID = pool.imageId;

		if (pool.networking) {
			securityGroups = pool.networking.securityGroups || [];
			publicIP = pool.networking.publicIP || false;
			allowedSourceAddresses = pool.networking.allowedSourceAddresses || [];
		}
	}

	// When finishing editing a pool, copy the local version to the resource.
	function workloadPoolDeactivate(index: number) {
		const pool: Compute.PoolV2 = {
			name: name,
			replicas: replicas,
			flavorId: flavorID,
			imageId: imageID
		};

		if (securityGroups || publicIP || allowedSourceAddresses) {
			pool.networking = {};

			if (securityGroups) {
				pool.networking.securityGroups = securityGroups;
			}

			if (publicIP) {
				pool.networking.publicIP = publicIP;
			}

			if (allowedSourceAddresses) {
				pool.networking.allowedSourceAddresses = allowedSourceAddresses;
			}
		}

		resource.spec.pools[index] = pool;
	}

	let workloadPoolActive = $state(true);

	// A workload pool is valid if all the fields in the pool are valid and
	// the name is unique among all other pools.
	let workloadPoolValid: boolean = $derived.by(() => {
		const names = resource.spec.pools.map((x) => x.name);
		const uniqueNames = new Set(names);

		if (names.length != uniqueNames.size) return false;

		return true;
	});
</script>

<ShellPageHeader {settings} />
<Stepper steps={2} bind:step {complete} {valid}>
	{#snippet content(index: number)}
		{#if index === 0}
			<h2 class="h2">Basic Configuration</h2>

			<ShellMetadataSection metadata={resource.metadata} {names} bind:valid={metadataValid} />
		{:else if index === 1}
			<ResourceList
				title="Workload Pool Configuration"
				columns={4}
				items={resource.spec.pools}
				initialItem={0}
				bind:active={workloadPoolActive}
				valid={workloadPoolValid}
				add={workloadPoolAdd}
				remove={workloadPoolRemove}
				activate={workloadPoolActivate}
				deactivate={workloadPoolDeactivate}
			>
				{#snippet description()}
					<p>
						Workload pools provide compute resouce for your cluster. You may have as many as
						required for your workload. Each pool has a set of CPU, GPU and memory that can be
						selected from a defined set of flavours.
					</p>
				{/snippet}

				<!-- eslint-disable @typescript-eslint/no-unused-vars -->
				{#snippet normal(pool: Compute.PoolV2, index: number)}
					<div class="h5 font-bold">{pool.name}</div>

					<div>
						{pool.replicas} replica{pool.replicas > 1 ? 's' : ''}
					</div>

					<Flavor flavor={lookupFlavor(pool.flavorId)} />
					<Image image={lookupImage(pool.imageId)} />
				{/snippet}

				{#snippet expanded(pool: Compute.PoolV2, index: number)}
					<ShellSection title="Pool Metadata">
						<TextInput
							label="Choose a name for your workload pool."
							hint={Validation.kubernetesLabelValueHint}
							validators={Validation.GetKubernetesLabelValueValidators([])}
							bind:value={name}
							bind:valid
						/>
					</ShellSection>

					<ShellSection title="Topology">
						<SelectNew
							value={flavorID}
							onValueChange={(e) => (flavorID = e.value)}
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
							value={imageID}
							onValueChange={(e) => (imageID = e.value)}
							options={images.map((x) => x.metadata.id)}
							label="Choose an instance image."
							hint="Allows the selection of the instances's operating system image."
						>
							{#snippet contents(id: string)}
								<Image image={lookupImage(id)} />
							{/snippet}
						</SelectNew>

						<RangeSlider
							name="size"
							label="Select the number of replicas."
							min={1}
							max={100}
							step={1}
							value={[replicas]}
							onValueChange={(e) => (replicas = e.value[0])}
						/>
					</ShellSection>

					<ShellSection title="Networking">
						<MultiSelect
							label="Security Groups"
							hint="Select security groups to apply to the instance.  By default all traffic can egress, none can ingress."
							value={securityGroups}
							onValueChange={(e) => (securityGroups = e.value)}
							options={data.securityGroups.map((x) => ({
								value: x.metadata.id,
								label: x.metadata.name
							}))}
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
				{/snippet}
			</ResourceList>
		{/if}
	{/snippet}
</Stepper>
