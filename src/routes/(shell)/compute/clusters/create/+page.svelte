<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/state';

	let { data }: { data: PageData } = $props();

	import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

	import * as Clients from '$lib/clients';
	import * as Compute from '$lib/openapi/compute';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import Stepper from '$lib/layouts/Stepper.svelte';
	import ResourceList from '$lib/layouts/ResourceList.svelte';
	import ComputeWorkloadPool from '$lib/ComputeWorkloadPool.svelte';
	import ComputeWorkloadPoolSecurityRule from '$lib/ComputeWorkloadPoolSecurityRule.svelte';
	import Flavor from '$lib/Flavor.svelte';
	import Image from '$lib/Image.svelte';

	const settings: ShellPageSettings = {
		feature: 'Infrastructure',
		name: 'Create Compute Cluster',
		description: 'Create and deploy a new compute cluster.',
		icon: 'mdi:server-network-outline'
	};

	let projectID = $derived(page.url.searchParams.get('projectID'));
	let regionID = $derived(page.url.searchParams.get('regionID'));
	let clusters = $derived(data.clusters.filter((x) => x.metadata.projectId == projectID));
	let names = $derived((clusters || []).map((x) => x.metadata.name));

	let resource: Compute.ComputeClusterWrite = $state({
		metadata: {
			name: uniqueNamesGenerator({
				dictionaries: [adjectives, animals],
				separator: '-',
				length: 2
			})
		},
		spec: {
			regionId: '',
			workloadPools: [
				{
					name: 'default',
					machine: {
						replicas: 1,
						flavorId: '',
						image: null,
						publicIPAllocation: {
							enabled: true
						},
						firewall: [
							{
								direction: Compute.FirewallRuleDirectionEnum.Ingress,
								protocol: Compute.FirewallRuleProtocolEnum.Tcp,
								port: 22,
								prefixes: ['0.0.0.0/0']
							}
						]
					}
				}
			]
		}
	});

	$effect.pre(() => {
		if (regionID) resource.spec.regionId = regionID;
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
		if (!projectID) return;

		const parameters = {
			organizationID: data.organizationID,
			projectID: projectID,
			computeClusterWrite: resource
		};

		Clients.compute()
			.apiV1OrganizationsOrganizationIDProjectsProjectIDClustersPost(parameters)
			.then((v: Compute.ComputeClusterRead) =>
				window.location.assign('/compute/clusters/view/' + v.metadata.id)
			)
			.catch((e: Error) => Clients.error(e));
	}

	let firewallRuleValid: boolean = $state(false);

	let firewallRuleActive: boolean = $state(false);

	// Firewall rules are only active for one workload pool at a time.  The initial pool will
	// get and SSH ingress, as that's what 99% of people will want e.g. being able to actually
	// access their cluster.
	let firewallRules: Array<Compute.FirewallRule> = $state([]);

	function firewallRuleAdd() {
		firewallRules.push({
			direction: Compute.FirewallRuleDirectionEnum.Ingress,
			protocol: Compute.FirewallRuleProtocolEnum.Tcp,
			port: 0,
			prefixes: ['0.0.0.0/0']
		});

		return firewallRules.length - 1;
	}

	function firewallRuleRemove(index: number) {
		firewallRules.splice(index, 1);
	}

	let workloadPoolValid: boolean = $state(false);

	let workloadPoolActive: boolean = $state(false);

	function workloadPoolAdd(): number {
		let pool: Compute.ComputeClusterWorkloadPool = {
			name: '',
			machine: {
				replicas: 1,
				flavorId: '',
				image: null,
				publicIPAllocation: {
					enabled: false
				},
				firewall: []
			}
		};

		resource.spec.workloadPools.push(pool);

		return resource.spec.workloadPools.length - 1;
	}

	function workloadPoolRemove(index: number) {
		resource.spec.workloadPools.splice(index, 1);
	}

	// When editing a pool, make a local copy of the firewall rule.
	function workloadPoolActivate(index: number) {
		firewallRules = resource.spec.workloadPools[index].machine.firewall || [];
	}

	// When finishing editing a pool, copy the local version to the resource.
	function workloadPoolDeactivate(index: number) {
		resource.spec.workloadPools[index].machine.firewall = firewallRules;
	}

	// A workload pool is valid if all the fields in the pool are valid and
	// the name is unique among all other pools.
	let workloadPoolValidFull: boolean = $derived.by(() => {
		if (firewallRuleActive || !workloadPoolValid) return false;

		const names = resource.spec.workloadPools.map((x) => x.name);
		const uniqueNames = new Set(names);

		if (names.length != uniqueNames.size) return false;

		return true;
	});

	function lookupFlavor(flavorID: string): Compute.Flavor | undefined {
		return data.flavors.find((x) => x.metadata.id == flavorID);
	}
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
				items={resource.spec.workloadPools}
				initialItem={0}
				bind:active={workloadPoolActive}
				valid={workloadPoolValidFull}
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
				{#snippet normal(pool: Compute.ComputeClusterWorkloadPool, index: number)}
					<div class="h5 font-bold">{pool.name}</div>

					<div>
						{pool.machine.replicas} replica{pool.machine.replicas > 1 ? 's' : ''}
					</div>

					<Flavor flavor={lookupFlavor(pool.machine.flavorId)} />

					<Image selector={pool.machine.image?.selector} />
				{/snippet}

				{#snippet expanded(pool: Compute.ComputeClusterWorkloadPool, index: number)}
					<ComputeWorkloadPool
						flavors={data.flavors}
						images={data.images}
						bind:pool={resource.spec.workloadPools[index]}
						bind:valid={workloadPoolValid}
					>
						{#snippet firewall()}
							<ResourceList
								title="Firewall Rules"
								titleClass="h3"
								columns={4}
								items={firewallRules}
								bind:active={firewallRuleActive}
								valid={firewallRuleValid}
								add={firewallRuleAdd}
								remove={firewallRuleRemove}
							>
								{#snippet normal(rule: Compute.FirewallRule, index: number)}
									<div class="flex gap-2 items-center">
										<iconify-icon icon="tabler:arrows-down-up" class="text-2xl"></iconify-icon>
										{rule.direction}
									</div>
									<div class="flex gap-2 items-center">
										<iconify-icon icon="tabler:protocol" class="text-2xl"></iconify-icon>
										{rule.protocol}
									</div>
									<div class="flex gap-2 items-center">
										<iconify-icon icon="fluent:usb-port-24-regular" class="text-2xl"></iconify-icon>
										{rule.port.toString() + (rule.portMax ? '-' + rule.portMax.toString() : '')}
									</div>
									<div class="flex gap-2 items-center">
										<iconify-icon icon="mdi:check-network-outline" class="text-2xl"></iconify-icon>

										{rule.prefixes.join(', ')}
									</div>
								{/snippet}

								{#snippet expanded(rule: Compute.FirewallRule, index: number)}
									<div class="flex flex-col gap-4">
										<ComputeWorkloadPoolSecurityRule
											bind:rule={firewallRules[index]}
											bind:valid={firewallRuleValid}
										/>
									</div>
								{/snippet}
							</ResourceList>
						{/snippet}
					</ComputeWorkloadPool>
				{/snippet}
			</ResourceList>
		{/if}
	{/snippet}
</Stepper>
