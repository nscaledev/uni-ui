<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	import { onMount } from 'svelte';
	import { validate as isUUID } from 'uuid';
	import * as Clients from '$lib/clients';
	import * as Compute from '$lib/openapi/compute';
	import { startPolling } from '$lib/loadutil';
	import { attachableVolumes, changedVolumeSelection, volumeCompatible } from '$lib/volumeutil';
	import FormPage from '$lib/layouts/FormPage.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import RichSelect from '$lib/forms/RichSelect.svelte';
	import MultiSelect from '$lib/forms/MultiSelect.svelte';
	import Select from '$lib/forms/Select.svelte';
	import Switch from '$lib/forms/Switch.svelte';
	import InputChips from '$lib/forms/InputChips.svelte';
	import Textarea from '$lib/forms/Textarea.svelte';
	import { resolveChip } from '$lib/layouts/effectiveStatus';
	import Flavor from '$lib/Flavor.svelte';
	import Image from '$lib/Image.svelte';
	import * as RegionUtil from '$lib/regionutil';
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
	function initUserData() {
		const encoded = data.instance.spec.userData;
		if (!encoded) return '';
		try {
			return decodeURIComponent(escape(atob(encoded)));
		} catch {
			return '';
		}
	}
	function initVolumeStatuses(): Array<Compute.InstanceVolumeStatus> {
		return data.instance.status.volumes ?? [];
	}
	function initVolumes(): Array<string> {
		return data.instance.spec.volumes ?? [];
	}
	let securityGroups: Array<string> = $state(initSecurityGroups());
	const initialVolumes = initVolumes();
	let volumes: Array<string> = $state(initVolumes());
	let volumeStatuses: Array<Compute.InstanceVolumeStatus> = $state(initVolumeStatuses());
	let publicIP = $state(initPublicIP());
	let allowedSourceAddresses: Array<string> = $state(initAllowedSourceAddresses());
	let userData = $state(initUserData());
	let flavors = $derived(
		data.flavors.filter(
			(x) =>
				isUUID(x.metadata.id) &&
				data.images.some(
					(y) => x.spec.disk >= y.spec.sizeGiB && x.spec.architecture === y.spec.architecture
				)
		)
	);
	let attachable = $derived(
		attachableVolumes(data.volumes, data.volumeClasses, resource.spec.flavorId, [
			...initialVolumes,
			...volumes
		])
	);
	let volumesCompatible = $derived(
		volumes.every((id) =>
			volumeCompatible(
				data.volumes.find((volume) => volume.metadata.id === id),
				data.volumeClasses,
				resource.spec.flavorId
			)
		)
	);
	$effect.pre(() => {
		if (flavors.some((x) => x.metadata.id === resource.spec.flavorId)) return;
		resource.spec.flavorId = flavors[0]?.metadata.id ?? '';
	});
	function lookupFlavor(id: string): Compute.Flavor {
		return flavors.find((x) => x.metadata.id == id) as Compute.Flavor;
	}
	let images = $derived(
		resource.spec.flavorId
			? data.images.filter(
					(x) =>
						x.spec.sizeGiB <= lookupFlavor(resource.spec.flavorId).spec.disk &&
						x.spec.architecture === lookupFlavor(resource.spec.flavorId).spec.architecture
				)
			: []
	);
	function lookupImage(id: string): Compute.Image {
		return images.find((x) => x.metadata.id == id) as Compute.Image;
	}
	$effect.pre(() => {
		if (images.find((x) => x.metadata.id == resource.spec.imageId)) return;
		resource.spec.imageId = images.length ? images[0].metadata.id : '';
	});
	const projectName = $derived(
		data.projects.find((p) => p.metadata.id === data.instance.metadata.projectId)?.metadata.name ??
			data.instance.metadata.projectId
	);
	const regionName = $derived(RegionUtil.name(data.regions, data.instance.status.regionId));
	const networkName = $derived(
		data.networks.find((n) => n.metadata.id === data.instance.status.networkId)?.metadata.name ??
			data.instance.status.networkId
	);
	let metadataValid = $state(false);
	let valid = $derived(
		metadataValid && !!resource.spec.flavorId && !!resource.spec.imageId && volumesCompatible
	);
	function submit() {
		resource.spec.networking = {};
		const changedVolumes = changedVolumeSelection(volumes, initialVolumes);
		if (changedVolumes === undefined) delete resource.spec.volumes;
		else resource.spec.volumes = changedVolumes;
		if (securityGroups.length) resource.spec.networking.securityGroups = securityGroups;
		if (publicIP) resource.spec.networking.publicIP = publicIP;
		if (allowedSourceAddresses.length)
			resource.spec.networking.allowedSourceAddresses = allowedSourceAddresses;
		resource.spec.userData = userData ? btoa(unescape(encodeURIComponent(userData))) : undefined;
		if (!resource.spec.sshCertificateAuthorityId) delete resource.spec.sshCertificateAuthorityId;
		Clients.compute()
			.apiV2InstancesInstanceIDPut({ instanceID: resource.metadata.id, instanceUpdate: resource })
			.then(() => window.location.assign('/compute/instances'))
			.catch((e: Error) => Clients.error(e));
	}
	async function refreshVolumeStatuses(): Promise<void> {
		try {
			const instance = await Clients.compute().apiV2InstancesInstanceIDGet({
				instanceID: data.instance.metadata.id
			});
			volumeStatuses = instance.status.volumes ?? [];
		} catch (error) {
			await Clients.error(error as Error);
		}
	}
	onMount(() => {
		void refreshVolumeStatuses();
		return startPolling(refreshVolumeStatuses);
	});
</script>

<FormPage
	breadcrumb={[
		{ label: 'Compute Instances', href: '/compute/instances' },
		{ label: resource.metadata.name }
	]}
	cancelHref="/compute/instances"
	submitLabel="Save Changes"
	description="Update your compute instance configuration."
	onSubmit={submit}
	{valid}
>
	{#snippet summary()}
		<dl class="summary">
			<dt>Project</dt>
			<dd>{projectName}</dd>
			<dt>Region</dt>
			<dd>{RegionUtil.flag(data.regions, data.instance.status.regionId)} {regionName}</dd>
			<dt>Network</dt>
			<dd>{networkName}</dd>
			<dt>Name</dt>
			<dd>{resource.metadata.name || '—'}</dd>
		</dl>
	{/snippet}

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
		<ShellSection title="Storage">
			<MultiSelect
				label="Volumes"
				hint="Existing block volumes attached to the instance."
				value={volumes}
				onValueChange={(e) => (volumes = e.value)}
				options={attachable.map((x) => ({ value: x.metadata.id, label: x.metadata.name }))}
			>
				{#snippet selected(id: string)}{attachable.find((x) => x.metadata.id == id)?.metadata
						.name}{/snippet}
			</MultiSelect>
			{#if volumeStatuses.length}
				<div class="table-wrap volume-statuses">
					<table class="table">
						<thead>
							<tr><th>Volume</th><th>Status</th><th>Device</th><th>Message</th></tr>
						</thead>
						<tbody>
							{#each volumeStatuses as status (status.id)}
								{@const chip = resolveChip(status.provisioningStatus, null)}
								<tr>
									<td class="primary"
										>{data.volumes.find((volume) => volume.metadata.id == status.id)?.metadata
											.name ?? status.id}</td
									>
									<td>
										{#if chip}
											<span class="chip chip--{chip.chipClass}"
												><span class="dot"></span>{chip.label}</span
											>
										{/if}
									</td>
									<td class="mono">{status.device ?? '—'}</td>
									<td>{status.message ?? '—'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</ShellSection>
		<ShellSection title="Networking">
			<MultiSelect
				label="Security groups"
				hint="Security groups to apply to the instance. By default all egress is allowed and no ingress."
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
		<ShellSection title="Security">
			<Select
				label="SSH certificate CA"
				hint="Attach an SSH certificate authority for user certificate-based access."
				bind:value={resource.spec.sshCertificateAuthorityId}
			>
				<option value="">None</option>
				{#each data.sshCertificateAuthorities as ca (ca.metadata.id)}<option value={ca.metadata.id}
						>{ca.metadata.name}</option
					>{/each}
			</Select>
		</ShellSection>
		<ShellSection title="User Data">
			<Textarea
				label="Cloud-init user data"
				hint="Cloud-init configuration applied on first boot. Accepts a shell script, cloud-config YAML, or a MIME multipart archive."
				placeholder="#cloud-config"
				bind:value={userData}
			/>
		</ShellSection>
	{/snippet}
</FormPage>

<style>
	.volume-statuses {
		margin-top: 16px;
	}
</style>
