<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

	import * as Clients from '$lib/clients';
	import * as Kubernetes from '$lib/openapi/kubernetes';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import Select from '$lib/forms/Select.svelte';
	import Stepper from '$lib/layouts/Stepper.svelte';
	import TimeWindow from '$lib/layouts/TimeWindow.svelte';
	import Switch from '$lib/forms/Switch.svelte';
	import ResourceList from '$lib/layouts/ResourceList.svelte';
	import KubernetesWorkloadPool from '$lib/KubernetesWorkloadPool.svelte';
	import Flavor from '$lib/Flavor.svelte';

	type KubernetesClusterFeaturesUI = Kubernetes.KubernetesClusterFeatures & {
		autoscaling?: boolean;
		gpuOperator?: boolean;
	};

	const DEFAULT_CLUSTER_FEATURES: KubernetesClusterFeaturesUI = {
		autoscaling: true,
		gpuOperator: true,
		observabilityAgent: false
	};

	const settings: ShellPageSettings = {
		feature: 'Infrastructure',
		name: 'Create Kubernetes Cluster',
		description: 'Create and deploy a new Kubernetes cluster.',
		icon: 'mdi:kubernetes'
	};

	const versions = [...new Set(data.images.map((x) => x.spec.softwareVersions?.kubernetes || ''))]
		.sort()
		.reverse();

	let clusters = $derived(data.clusters.filter((x) => x.metadata.projectId == data.projectID));
	let names: Array<string> = $derived((clusters || []).map((x) => x.metadata.name));

	let resource: Kubernetes.KubernetesClusterWrite = $state({
		metadata: {
			name: uniqueNamesGenerator({
				dictionaries: [adjectives, animals],
				separator: '-',
				length: 2
			})
		},
		spec: {
			regionId: data.regionID,
			version: versions[0],
			features: { ...DEFAULT_CLUSTER_FEATURES },
			autoUpgrade: {
				enabled: true
			},
			workloadPools: [
				{
					name: 'default',
					machine: {
						replicas: 3
					},
					autoscaling: {
						minimumReplicas: 0
					}
				}
			]
		}
	});

	function clusterFeatures(): KubernetesClusterFeaturesUI {
		if (!resource.spec.features) {
			resource.spec.features = { ...DEFAULT_CLUSTER_FEATURES };
		}

		return resource.spec.features as KubernetesClusterFeaturesUI;
	}

	function observabilityAgentChange(e: { checked: boolean }) {
		const features = clusterFeatures();

		features.observabilityAgent = e.checked;
	}

	function autoUpgradeChange(e: { checked: boolean }) {
		if (!resource.spec.autoUpgrade) {
			resource.spec.autoUpgrade = { enabled: e.checked };
			return;
		}

		resource.spec.autoUpgrade.enabled = e.checked;
	}

	function autoUpgradeOverideChange(e: { checked: boolean }) {
		if (!resource.spec.autoUpgrade) return;

		if (e.checked) {
			resource.spec.autoUpgrade.daysOfWeek = {};
		} else {
			delete resource.spec.autoUpgrade.daysOfWeek;
		}
	}

	function autoUpgradeChangeSunday(checked: boolean, start: number, end: number) {
		if (!resource.spec.autoUpgrade?.daysOfWeek) return;

		if (checked) {
			resource.spec.autoUpgrade.daysOfWeek.sunday = { start: start, end: end };
			return;
		}

		delete resource.spec.autoUpgrade.daysOfWeek.sunday;
	}

	function autoUpgradeChangeMonday(checked: boolean, start: number, end: number) {
		if (!resource.spec.autoUpgrade?.daysOfWeek) return;

		if (checked) {
			resource.spec.autoUpgrade.daysOfWeek.monday = { start: start, end: end };
			return;
		}

		delete resource.spec.autoUpgrade.daysOfWeek.monday;
	}

	function autoUpgradeChangeTuesday(checked: boolean, start: number, end: number) {
		if (!resource.spec.autoUpgrade?.daysOfWeek) return;

		if (checked) {
			resource.spec.autoUpgrade.daysOfWeek.tuesday = { start: start, end: end };
			return;
		}

		delete resource.spec.autoUpgrade.daysOfWeek.tuesday;
	}

	function autoUpgradeChangeWednesday(checked: boolean, start: number, end: number) {
		if (!resource.spec.autoUpgrade?.daysOfWeek) return;

		if (checked) {
			resource.spec.autoUpgrade.daysOfWeek.wednesday = { start: start, end: end };
			return;
		}

		delete resource.spec.autoUpgrade.daysOfWeek.wednesday;
	}

	function autoUpgradeChangeThursday(checked: boolean, start: number, end: number) {
		if (!resource.spec.autoUpgrade?.daysOfWeek) return;

		if (checked) {
			resource.spec.autoUpgrade.daysOfWeek.thursday = { start: start, end: end };
			return;
		}

		delete resource.spec.autoUpgrade.daysOfWeek.thursday;
	}

	function autoUpgradeChangeFriday(checked: boolean, start: number, end: number) {
		if (!resource.spec.autoUpgrade?.daysOfWeek) return;

		if (checked) {
			resource.spec.autoUpgrade.daysOfWeek.friday = { start: start, end: end };
			return;
		}

		delete resource.spec.autoUpgrade.daysOfWeek.friday;
	}

	function autoUpgradeChangeSaturday(checked: boolean, start: number, end: number) {
		if (!resource.spec.autoUpgrade?.daysOfWeek) return;

		if (checked) {
			resource.spec.autoUpgrade.daysOfWeek.saturday = { start: start, end: end };
			return;
		}

		delete resource.spec.autoUpgrade.daysOfWeek.saturday;
	}

	let workloadPoolValid: boolean = $state(false);

	let workloadPoolActive: boolean = $state(false);

	function workloadPoolAdd(): number {
		let pool: Kubernetes.KubernetesClusterWorkloadPool = {
			name: '',
			machine: {
				replicas: 3
			},
			autoscaling: {
				minimumReplicas: 0
			}
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
			kubernetesClusterWrite: resource
		};

		Clients.kubernetes()
			.apiV1OrganizationsOrganizationIDProjectsProjectIDClustersPost(parameters)
			.then(() => window.location.assign('/kubernetes/clusters'))
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

	function replicasString(pool: Kubernetes.KubernetesClusterWorkloadPool): string {
		let out = '';

		// TODO: should always be set!!
		if (pool.autoscaling) out += pool.autoscaling.minimumReplicas.toString() + '-';
		if (pool.machine.replicas) out += pool.machine.replicas.toString();

		out += ' replica';

		if (pool.autoscaling || pool.machine.replicas) out += 's';

		return out;
	}
</script>

<ShellPageHeader {settings} />
<Stepper steps={3} bind:step {valid} {complete}>
	{#snippet content(index: number)}
		{#if index === 0}
			<h2 class="h2">Basic Configuration</h2>

			<ShellMetadataSection metadata={resource.metadata} {names} bind:valid={metadataValid} />

			<ShellSection title="Kubernetes Configuration">
				<Select
					label="Choose a Kubernetes version."
					hint="Kubernetes provides guarantees backward
                                                compatibility so choosing the newest is usually the right choice as that provides a rich
                                                feature set and enhanced security. Certain applications — e.g. Kubeflow —
                                                may require a specific version."
					bind:value={resource.spec.version}
				>
					{#each versions as version}
						<option value={version}>{version}</option>
					{/each}
				</Select>
			</ShellSection>
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
						selected from a defined set of flavours. Workload pools support automatic scaling, thus
						reducing overall operational cost when not in use.
					</p>
				{/snippet}

				<!-- eslint-disable @typescript-eslint/no-unused-vars -->
				{#snippet normal(pool: Kubernetes.KubernetesClusterWorkloadPool, index: number)}
					<div class="h5 font-bold">{pool.name}</div>

					<div>{replicasString(pool)}</div>

					<Flavor flavor={lookupFlavor(pool.machine.flavorId)} />
				{/snippet}

				<!-- eslint-disable @typescript-eslint/no-unused-vars -->
				{#snippet expanded(pool: Kubernetes.KubernetesClusterWorkloadPool, index: number)}
					<KubernetesWorkloadPool
						flavors={data.flavors}
						bind:pool={resource.spec.workloadPools[index]}
						bind:valid={workloadPoolValid}
					/>
				{/snippet}
			</ResourceList>
		{:else if index === 2}
			<h2 class="h2">Advanced Options</h2>

			<ShellSection title="Observability Agent">
				<p>
					Install the observability agent to collect Kubernetes metrics and telemetry and forward them to your observability stack.
				</p>

				<Switch
					name="observability-agent"
					label="Deploy observability agent"
					hint="Installs telemetry collectors in the cluster."
					initial={Boolean(resource.spec.features?.observabilityAgent)}
					onCheckedChange={observabilityAgentChange}
				/>
			</ShellSection>

			<ShellSection title="Auto Upgrade">
				<p>
					Kubernetes clusters are provisioned using pre-defined bundles of applications. These are
					periodically updated to provide security updates, bug fixes and platorm stability. These
					are enabled by default to protect you and mitigate any issues that may arise.
				</p>

				<Switch
					name="autoupgrade"
					label="Enable auto-upgrade"
					hint="Upgrades may still occur as application bundles reach end-of-life even if you choose to opt out."
					initial={true}
					onCheckedChange={autoUpgradeChange}
				/>

				{#if resource.spec.autoUpgrade?.enabled}
					<Switch
						name="autoupgradeoverride"
						label="Override auto-upgrade default time windows"
						hint="Auto upgrades are scheduled Monday-Friday beween 00:00 and 07:00 UTC.  This provides a good level of support coverage, and upgrades occur outside of European business hours."
						onCheckedChange={autoUpgradeOverideChange}
					/>

					{#if resource.spec.autoUpgrade?.daysOfWeek}
						<div class="grid grid-cols-[auto_auto_1fr] gap-4">
							<TimeWindow title="Sunday" onChange={autoUpgradeChangeSunday} />
							<TimeWindow title="Monday" onChange={autoUpgradeChangeMonday} />
							<TimeWindow title="Tuesday" onChange={autoUpgradeChangeTuesday} />
							<TimeWindow title="Wednesday" onChange={autoUpgradeChangeWednesday} />
							<TimeWindow title="Thursday" onChange={autoUpgradeChangeThursday} />
							<TimeWindow title="Friday" onChange={autoUpgradeChangeFriday} />
							<TimeWindow title="Saturday" onChange={autoUpgradeChangeSaturday} />
						</div>
					{/if}
				{/if}
			</ShellSection>
		{/if}
	{/snippet}
</Stepper>
