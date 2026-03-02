<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

	import * as Clients from '$lib/clients';
	import * as Kubernetes from '$lib/openapi/kubernetes';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import Stepper from '$lib/layouts/Stepper.svelte';
	import ResourceList from '$lib/layouts/ResourceList.svelte';
	import VirtualKubernetesWorkloadPool from '$lib/VirtualKubernetesWorkloadPool.svelte';
	import Flavor from '$lib/Flavor.svelte';

	const settings: ShellPageSettings = {
		feature: 'Infrastructure',
		name: 'Create Virtual Kubernetes Cluster',
		description: 'Create and deploy a new Kubernetes cluster.',
		icon: 'mdi:kubernetes'
	};

	let clusters = $derived(data.clusters.filter((x) => x.metadata.projectId == data.projectID));
	let names: Array<string> = $derived((clusters || []).map((x) => x.metadata.name));

	function initialRegionID(): string {
		return data.regionID;
	}

	let resource: Kubernetes.VirtualKubernetesClusterWrite = $state({
		metadata: {
			name: uniqueNamesGenerator({
				dictionaries: [adjectives, animals],
				separator: '-',
				length: 2
			})
		},
		spec: {
			regionId: initialRegionID(),
			workloadPools: [
				{
					name: 'default',
					flavorId: '',
					replicas: 3
				}
			]
		}
	});

	let workloadPoolValid: boolean = $state(false);

	let workloadPoolActive: boolean = $state(false);

	function workloadPoolAdd(): number {
		let pool: Kubernetes.VirtualKubernetesClusterWorkloadPool = {
			name: '',
			flavorId: '',
			replicas: 3
		};

		resource.spec.workloadPools.push(pool);

		return resource.spec.workloadPools.length - 1;
	}

	function workloadPoolRemove(index: number) {
		resource.spec.workloadPools.splice(index, 1);
	}

	// A workload pool is valid if all the fields in the pool are valid and
	// the name is unique among all other pools.
	let workloadPoolValidFull: boolean = $derived.by(() => {
		if (!workloadPoolValid) return false;

		const names = resource.spec.workloadPools.map((x) => x.name);
		const uniqueNames = new Set(names);

		if (names.length != uniqueNames.size) return false;

		return true;
	});

	function complete() {
		const parameters = {
			organizationID: data.organizationID,
			projectID: data.projectID,
			virtualKubernetesClusterWrite: resource
		};

		Clients.kubernetes()
			.apiV1OrganizationsOrganizationIDProjectsProjectIDVirtualclustersPost(parameters)
			.then(() => window.location.assign('/kubernetes/virtualclusters'))
			.catch((e: Error) => Clients.error(e));
	}

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

		if (resource.spec.workloadPools.length == 0) return false;

		return true;
	});

	// Roll up the overall validity for the stepper to allow progress.
	let valid = $derived(step1valid && step2valid);

	function lookupFlavor(flavorID: string | undefined): Kubernetes.Flavor | undefined {
		if (!flavorID) return;

		return data.flavors.find((x) => x.metadata.id == flavorID);
	}

	function replicasString(pool: Kubernetes.VirtualKubernetesClusterWorkloadPool): string {
		let out = '';

		// TODO: should always be set!!
		if (pool.replicas) out += pool.replicas.toString();

		out += ' replica';

		return out;
	}
</script>

<ShellPageHeader {settings} />
<Stepper steps={2} bind:step {valid} {complete}>
	{#snippet content(index: number)}
		{#if index === 0}
			<h2 class="h2">Basic Configuration</h2>

			<ShellMetadataSection metadata={resource.metadata} {names} bind:valid={metadataValid} />
		{:else if index === 1}
			<ResourceList
				title="Workload Pool Configuration"
				columns={3}
				items={resource.spec.workloadPools}
				initialItem={0}
				bind:active={workloadPoolActive}
				valid={workloadPoolValidFull}
				add={workloadPoolAdd}
				remove={workloadPoolRemove}
			>
				{#snippet description()}
					<p>
						Workload pools provide compute resouce for your cluster. You may have as many as
						required for your workload. Each pool has a set of CPU, GPU and memory that can be
						selected from a defined set of flavours.
					</p>
				{/snippet}

				<!-- eslint-disable @typescript-eslint/no-unused-vars -->
				{#snippet normal(pool: Kubernetes.VirtualKubernetesClusterWorkloadPool, index: number)}
					<div class="h5 font-bold">{pool.name}</div>

					<div>{replicasString(pool)}</div>

					<Flavor flavor={lookupFlavor(pool.flavorId)} />
				{/snippet}

				<!-- eslint-disable @typescript-eslint/no-unused-vars -->
				{#snippet expanded(pool: Kubernetes.VirtualKubernetesClusterWorkloadPool, index: number)}
					<VirtualKubernetesWorkloadPool
						flavors={data.flavors}
						bind:pool={resource.spec.workloadPools[index]}
						bind:valid={workloadPoolValid}
					/>
				{/snippet}
			</ResourceList>
		{/if}
	{/snippet}
</Stepper>
