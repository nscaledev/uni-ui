<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	import * as Clients from '$lib/clients';
	import * as Kubernetes from '$lib/openapi/kubernetes';
	import * as RegionUtil from '$lib/regionutil';
	import FormPage from '$lib/layouts/FormPage.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import Select from '$lib/forms/Select.svelte';
	import Switch from '$lib/forms/Switch.svelte';
	import TimeWindow from '$lib/layouts/TimeWindow.svelte';
	import ResourceList from '$lib/layouts/ResourceList.svelte';
	import KubernetesWorkloadPool from '$lib/KubernetesWorkloadPool.svelte';
	import Flavor from '$lib/Flavor.svelte';

	function initialVersions(): Array<string> {
		return [...new Set(data.images.map((x) => x.spec.softwareVersions?.kubernetes || ''))]
			.sort()
			.reverse();
	}

	const versions = initialVersions();

	let resource = $derived.by(() => {
		const write: Kubernetes.KubernetesClusterWrite = $state({
			metadata: { name: data.cluster.metadata.name },
			spec: {
				regionId: data.cluster.spec.regionId,
				version: data.cluster.spec.version,
				autoUpgrade: data.cluster.spec.autoUpgrade ?? { enabled: true },
				features: data.cluster.spec.features ?? { hardwareEnablement: false },
				workloadPools: data.cluster.spec.workloadPools.map((p) => ({ ...p }))
			}
		});
		return write;
	});

	function autoUpgradeChange(e: { checked: boolean }) {
		if (!resource.spec.autoUpgrade) resource.spec.autoUpgrade = { enabled: e.checked };
		else resource.spec.autoUpgrade.enabled = e.checked;
	}

	function autoUpgradeOverrideChange(e: { checked: boolean }) {
		if (!resource.spec.autoUpgrade) return;
		if (e.checked) resource.spec.autoUpgrade.daysOfWeek = {};
		else delete resource.spec.autoUpgrade.daysOfWeek;
	}

	function autoUpgradeDayChange(
		day: keyof Kubernetes.KubernetesClusterAutoUpgradeDaysOfWeek,
		checked: boolean,
		start: number,
		end: number
	) {
		if (!resource.spec.autoUpgrade?.daysOfWeek) return;
		if (checked) resource.spec.autoUpgrade.daysOfWeek[day] = { start, end };
		else delete resource.spec.autoUpgrade.daysOfWeek[day];
	}

	let workloadPoolValid = $state(false);
	let workloadPoolActive = $state(false);

	function workloadPoolAdd(): number {
		resource.spec.workloadPools.push({
			name: '',
			machine: { replicas: 3 },
			autoscaling: { minimumReplicas: 0 }
		});
		return resource.spec.workloadPools.length - 1;
	}

	function workloadPoolRemove(index: number) {
		resource.spec.workloadPools.splice(index, 1);
	}

	let workloadPoolValidFull = $derived.by(() => {
		if (!workloadPoolValid) return false;
		const poolNames = resource.spec.workloadPools.map((x) => x.name);
		return poolNames.length === new Set(poolNames).size;
	});

	const projectName = $derived(
		data.projects?.find((p) => p.metadata.id === data.cluster.metadata.projectId)?.metadata.name ??
			data.cluster.metadata.projectId
	);
	const regionName = $derived(RegionUtil.name(data.regions, data.cluster.spec.regionId));

	let metadataValid = $state(false);
	let valid = $derived(
		metadataValid &&
			!workloadPoolActive &&
			resource.spec.workloadPools.length > 0 &&
			workloadPoolValidFull
	);

	function lookupFlavor(flavorID: string | undefined): Kubernetes.Flavor | undefined {
		if (!flavorID) return;
		return data.flavors.find((x) => x.metadata.id == flavorID);
	}

	function replicasString(pool: Kubernetes.KubernetesClusterWorkloadPool): string {
		let out = '';
		if (pool.autoscaling) out += pool.autoscaling.minimumReplicas.toString() + '–';
		if (pool.machine.replicas) out += pool.machine.replicas.toString();
		out += ' replica';
		if (pool.autoscaling || pool.machine.replicas) out += 's';
		return out;
	}

	function submit() {
		Clients.kubernetes()
			.apiV1OrganizationsOrganizationIDProjectsProjectIDClustersClusterIDPut({
				organizationID: data.organizationID,
				projectID: data.cluster.metadata.projectId,
				clusterID: data.cluster.metadata.id,
				kubernetesClusterWrite: resource
			})
			.then(() => window.location.assign('/kubernetes/clusters'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<FormPage
	breadcrumb={[
		{ label: 'Kubernetes Clusters', href: '/kubernetes/clusters' },
		{ label: resource.metadata.name }
	]}
	cancelHref="/kubernetes/clusters"
	submitLabel="Save Changes"
	description="Update your Kubernetes cluster configuration."
	onSubmit={submit}
	{valid}
>
	{#snippet summary()}
		<dl class="summary">
			<dt>Project</dt>
			<dd>{projectName}</dd>
			<dt>Region</dt>
			<dd>{RegionUtil.flag(data.regions, data.cluster.spec.regionId)} {regionName}</dd>
			<dt>Name</dt>
			<dd>{resource.metadata.name || '—'}</dd>
			<dt>Version</dt>
			<dd>{resource.spec.version}</dd>
		</dl>
	{/snippet}

	{#snippet form()}
		<ShellMetadataSection
			metadata={resource.metadata}
			names={data.names}
			bind:valid={metadataValid}
		/>
		<ShellSection title="Kubernetes Configuration">
			<Select
				label="Choose a Kubernetes version."
				hint="Kubernetes provides backward compatibility guarantees — choosing the newest is usually right."
				bind:value={resource.spec.version}
			>
				{#each versions as version}<option value={version}>{version}</option>{/each}
			</Select>
		</ShellSection>
		<ResourceList
			title="Workload Pool Configuration"
			columns={3}
			items={resource.spec.workloadPools}
			bind:active={workloadPoolActive}
			valid={workloadPoolValidFull}
			add={workloadPoolAdd}
			remove={workloadPoolRemove}
		>
			{#snippet description()}<p class="text-2 text-sm">
					Workload pools provide compute resource for your cluster. Each pool supports independent
					flavor and autoscaling configuration.
				</p>{/snippet}
			{#snippet normal(pool: Kubernetes.KubernetesClusterWorkloadPool)}
				<div class="pool-name">{pool.name}</div>
				<div class="text-2 text-sm">{replicasString(pool)}</div>
				<Flavor flavor={lookupFlavor(pool.machine.flavorId)} />
			{/snippet}
			<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
			{#snippet expanded(_pool: Kubernetes.KubernetesClusterWorkloadPool, index: number)}
				<KubernetesWorkloadPool
					flavors={data.flavors}
					bind:pool={resource.spec.workloadPools[index]}
					bind:valid={workloadPoolValid}
				/>
			{/snippet}
		</ResourceList>
		<ShellSection title="Hardware Enablement">
			<p class="text-2 text-sm">
				Installs hardware operators and drivers such as the GPU operator on the cluster.
			</p>
			<Switch
				name="hardwareenablement"
				label="Enable hardware operators"
				hint="Required for GPU workload pools or specialized network drivers."
				initial={data.cluster.spec.features?.hardwareEnablement ?? false}
				onCheckedChange={(e) => (resource.spec.features = { hardwareEnablement: e.checked })}
			/>
		</ShellSection>
		<ShellSection title="Auto Upgrade">
			<p class="text-2 text-sm">
				Kubernetes clusters use pre-defined application bundles that are periodically updated for
				security and stability.
			</p>
			<Switch
				name="autoupgrade"
				label="Enable auto-upgrade"
				hint="Upgrades may still occur as bundles reach end-of-life even if you opt out."
				initial={data.cluster.spec.autoUpgrade?.enabled ?? true}
				onCheckedChange={autoUpgradeChange}
			/>
			{#if resource.spec.autoUpgrade?.enabled}
				<Switch
					name="autoupgradeoverride"
					label="Override auto-upgrade default time windows"
					hint="Default: Monday–Friday 00:00–07:00 UTC."
					initial={!!data.cluster.spec.autoUpgrade?.daysOfWeek}
					onCheckedChange={autoUpgradeOverrideChange}
				/>
				{#if resource.spec.autoUpgrade?.daysOfWeek}
					<div class="time-windows">
						{#each ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as day (day)}
							{@const existing =
								data.cluster.spec.autoUpgrade?.daysOfWeek?.[
									day as keyof Kubernetes.KubernetesClusterAutoUpgradeDaysOfWeek
								]}
							<TimeWindow
								title={day.charAt(0).toUpperCase() + day.slice(1)}
								checked={!!existing}
								start={existing?.start}
								end={existing?.end}
								onChange={(c, s, e) =>
									autoUpgradeDayChange(
										day as keyof Kubernetes.KubernetesClusterAutoUpgradeDaysOfWeek,
										c,
										s,
										e
									)}
							/>
						{/each}
					</div>
				{/if}
			{/if}
		</ShellSection>
	{/snippet}
</FormPage>

<style>
	.pool-name {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-1);
	}
	.text-2 {
		color: var(--text-2);
	}
	.text-sm {
		font-size: 13px;
	}
	.time-windows {
		display: grid;
		grid-template-columns: auto auto 1fr;
		gap: 16px;
	}
</style>
