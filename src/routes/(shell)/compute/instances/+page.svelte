<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { startAutoRefresh } from '$lib/loadutil';
	import { browser } from '$app/environment';
	let { data }: { data: PageData } = $props();
	import * as Clients from '$lib/clients';
	import * as Compute from '$lib/openapi/compute';
	import * as Region from '$lib/openapi/region';
	import * as RegionUtil from '$lib/regionutil';
	import * as MachineStatus from '$lib/machineStatus';
	import { resolveChip, fromPowerState } from '$lib/layouts/effectiveStatus';
	import { ageFormatter } from '$lib/formatters';
	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ListPage from '$lib/layouts/ListPage.svelte';
	import ShellList from '$lib/layouts/ShellList.svelte';
	import ShellListItem from '$lib/layouts/ShellListItem.svelte';
	import ShellListItemHeader from '$lib/layouts/ShellListItemHeader.svelte';
	import ShellListItemBadges from '$lib/layouts/ShellListItemBadges.svelte';
	import ShellListItemMetadata from '$lib/layouts/ShellListItemMetadata.svelte';
	import ShellMetadataItem from '$lib/layouts/ShellMetadataItem.svelte';
	import Badge from '$lib/layouts/Badge.svelte';
	import Placeholder from '$lib/layouts/Placeholder.svelte';
	import PopupButton from '$lib/forms/PopupButton.svelte';
	import ModalIcon from '$lib/layouts/ModalIcon.svelte';
	import RowMenu from '$lib/layouts/RowMenu.svelte';
	import Icon from '$lib/primitives/Icon.svelte';
	const settings: ShellPageSettings = {
		feature: 'Infrastructure',
		name: 'Compute Instances',
		description: 'Manage your compute instances.',
		icon: 'server'
	};
	onMount(() => startAutoRefresh('layout:instances'));
	// eslint-disable-next-line svelte/valid-compile
	let createNetworkID = $state(data.networks[0]?.metadata.id);

	const createNetwork = $derived(
		data.networks.length === 1 ? data.networks[0] : lookupNetwork(createNetworkID ?? '')
	);
	const createURL = $derived(
		`/compute/instances/create?projectID=${createNetwork?.metadata.projectId}&regionID=${createNetwork?.status?.regionId}&networkID=${createNetwork?.metadata.id}`
	);
	const skipPopup = $derived(data.networks.length === 1);
	function lookupNetwork(id: string): Region.NetworkV2Read {
		return data.networks.find((x) => x.metadata.id == id) as Region.NetworkV2Read;
	}
	function sshCertificateAuthorityName(resource: Compute.InstanceRead): string | undefined {
		if (!resource.spec.sshCertificateAuthorityId) return;
		const ca = data.sshCertificateAuthorities.find(
			(x) => x.metadata.id == resource.spec.sshCertificateAuthorityId
		);
		return ca?.metadata.name ?? resource.spec.sshCertificateAuthorityId;
	}
	const PROJECT_PALETTE = [
		'oklch(0.65 0.18 220)',
		'oklch(0.65 0.18 290)',
		'oklch(0.68 0.16 30)',
		'oklch(0.65 0.18 340)',
		'oklch(0.65 0.16 170)',
		'oklch(0.68 0.16 80)'
	];

	function instanceProject(resource: Compute.InstanceRead) {
		const idx = data.projects.findIndex((p) => p.metadata.id === resource.metadata.projectId);
		if (idx < 0) return null;
		return {
			name: data.projects[idx].metadata.name,
			color: PROJECT_PALETTE[idx % PROJECT_PALETTE.length]
		};
	}

	function deleteInstance(resource: Compute.InstanceRead) {
		Clients.compute()
			.apiV2InstancesInstanceIDDelete({ instanceID: resource.metadata.id })
			.then(() => invalidate('layout:instances'))
			.catch((e: Error) => Clients.error(e));
	}

	async function bulkDeleteInstances(ids: Set<string>, clear: () => void) {
		await Promise.allSettled(
			[...ids].map((id) => Clients.compute().apiV2InstancesInstanceIDDelete({ instanceID: id }))
		);
		clear();
		invalidate('layout:instances');
	}
	function getSSHKey(resource: Compute.InstanceRead) {
		if (!browser) return;
		Clients.compute()
			.apiV2InstancesInstanceIDSshkeyGet({ instanceID: resource.metadata.id })
			.then((key: Compute.SshKey) => {
				const a = document.createElement('a');
				a.href = URL.createObjectURL(new Blob([key.privateKey]));
				a.download = `id_${resource.metadata.name}`;
				a.click();
			})
			.catch((e: Error) => Clients.error(e));
	}
	function start(resource: Compute.InstanceRead) {
		Clients.compute()
			.apiV2InstancesInstanceIDStartPost({ instanceID: resource.metadata.id })
			.catch((e: Error) => Clients.error(e));
	}
	function stop(resource: Compute.InstanceRead) {
		Clients.compute()
			.apiV2InstancesInstanceIDStopPost({ instanceID: resource.metadata.id })
			.catch((e: Error) => Clients.error(e));
	}
	function rebootSoft(resource: Compute.InstanceRead) {
		Clients.compute()
			.apiV2InstancesInstanceIDRebootPost({ instanceID: resource.metadata.id })
			.catch((e: Error) => Clients.error(e));
	}
	function rebootHard(resource: Compute.InstanceRead) {
		Clients.compute()
			.apiV2InstancesInstanceIDRebootPost({ instanceID: resource.metadata.id, hard: true })
			.catch((e: Error) => Clients.error(e));
	}
</script>

<ListPage
	{settings}
	resources={data.instances}
	projects={data.projectID ? [] : data.projects}
	regions={data.regions}
	tableHeaders={['Name', 'Status', 'Project', 'Region', 'IP', 'Owner', 'Age', '']}
>
	{#snippet bulkbar({ ids, clear })}
		<ModalIcon
			icon="trash"
			label="Delete ({ids.size})"
			class="btn btn--sm btn--danger"
			title="Delete {ids.size} instance{ids.size === 1 ? '' : 's'}?"
			confirm={() => bulkDeleteInstances(ids, clear)}
		>
			This will permanently remove {ids.size} instance{ids.size === 1 ? '' : 's'}.
		</ModalIcon>
	{/snippet}

	{#snippet tableRow(resource)}
		{@const chip = resolveChip(
			resource.metadata.provisioningStatus,
			fromPowerState(resource.status.powerState)
		)}
		{@const proj = instanceProject(resource)}
		<td class="primary">
			<a href="/compute/instances/edit/{resource.metadata.id}">
				<div>{resource.metadata.name}</div>
				<div class="sub">{resource.metadata.id}</div>
			</a>
		</td>
		<td>
			{#if chip}<span class="chip chip--{chip.chipClass}"
					><span class="dot"></span>{chip.label}</span
				>{/if}
		</td>
		<td>
			{#if proj}<span class="chip"
					><span class="dot" style="background:{proj.color}"></span>{proj.name}</span
				>{/if}
		</td>
		<td>
			<span class="mono region-cell">
				{RegionUtil.flag(data.regions, resource.status.regionId)}
				{RegionUtil.name(data.regions, resource.status.regionId)}
			</span>
		</td>
		<td>
			{#if resource.status.privateIP}
				<span class="mono">{resource.status.privateIP}</span>
				{#if resource.status.publicIP}
					<div class="sub">{resource.status.publicIP}</div>
				{/if}
			{:else}
				<span class="mono">—</span>
			{/if}
		</td>
		<td>{resource.metadata.createdBy}</td>
		<td><span class="mono">{ageFormatter(resource.metadata.creationTime)}</span></td>
		<RowMenu>
			{#snippet menu()}
				{#if !resource.spec.sshCertificateAuthorityId}
					<div class="menu__title">Access</div>
					<button class="menu__item" onclick={() => getSSHKey(resource)}>
						<Icon name="key" size={14} /> Download SSH key
					</button>
				{/if}
				<div class="menu__title">Power</div>
				<ModalIcon
					icon={resource.status.powerState !== Compute.InstanceLifecyclePhase.Stopped
						? 'stop'
						: 'play'}
					label={resource.status.powerState !== Compute.InstanceLifecyclePhase.Stopped
						? 'Stop'
						: 'Start'}
					class="menu__item"
					title="Are you sure?"
					confirm={() =>
						resource.status.powerState !== Compute.InstanceLifecyclePhase.Stopped
							? stop(resource)
							: start(resource)}
					disabled={!MachineStatus.canStopOrStart(resource.status.powerState)}
				>
					{resource.status.powerState !== Compute.InstanceLifecyclePhase.Stopped ? 'Stop' : 'Start'}
					instance?
				</ModalIcon>
				<ModalIcon
					icon="refresh"
					label="Soft reboot"
					class="menu__item"
					title="Soft reboot?"
					confirm={() => rebootSoft(resource)}
					disabled={!MachineStatus.canReboot(resource.status.powerState)}
				>
					Soft-reboot "{resource.metadata.name}"?
				</ModalIcon>
				<ModalIcon
					icon="restartAlert"
					label="Hard reboot"
					class="menu__item"
					title="Hard reboot?"
					confirm={() => rebootHard(resource)}
					disabled={!MachineStatus.canReboot(resource.status.powerState)}
				>
					Force-reboot "{resource.metadata.name}"?
				</ModalIcon>
				<div class="menu__title">Danger</div>
				<ModalIcon
					icon="trash"
					label="Delete"
					class="menu__item menu__item--danger"
					title="Delete instance?"
					confirm={() => deleteInstance(resource)}
				>
					Removing "{resource.metadata.name}" is permanent.
				</ModalIcon>
			{/snippet}
		</RowMenu>
	{/snippet}

	{#snippet tools()}
		{#if data.projects.length}
			{#if skipPopup}
				<a href={createURL} class="btn btn--primary"><Icon name="plus" size={16} /> Create</a>
			{:else}
				<PopupButton icon="plus" label="Create">
					{#snippet contents(close)}
						<div class="create-popup">
							<div class="menu__title" style="padding-inline: 0">Network</div>
							<div class="picker">
								<Icon name="network" size={14} />
								<select bind:value={createNetworkID}>
									{#each data.networks as n}
										<option value={n.metadata.id}>{n.metadata.name}</option>
									{/each}
								</select>
							</div>
							<div class="create-popup__footer">
								<button onclick={close} class="btn btn--ghost btn--sm">Cancel</button>
								<a href={createURL} class="btn btn--primary btn--sm">Continue</a>
							</div>
						</div>
					{/snippet}
				</PopupButton>
			{/if}
		{/if}
	{/snippet}
	{#snippet list(instances)}<ShellList
			>{#each instances as resource}<ShellListItem id={resource.metadata.id}>
					{#snippet main()}<ShellListItemHeader
							metadata={resource.metadata}
							href="/compute/instances/edit/{resource.metadata.id}"
						/>{/snippet}
					{#snippet badges()}
						<ShellListItemBadges
							metadata={resource.metadata}
							projects={data.projects}
							operationalStatus={fromPowerState(resource.status.powerState)}
						>
							{#snippet extra()}
								<Badge
									>{RegionUtil.flag(data.regions, resource.status.regionId)}
									{RegionUtil.name(data.regions, resource.status.regionId)}</Badge
								>
							{/snippet}
						</ShellListItemBadges>
					{/snippet}
					{#snippet menu()}
						{#if !resource.spec.sshCertificateAuthorityId}
							<div class="menu__title">Access</div>
							<button class="menu__item" onclick={() => getSSHKey(resource)}>
								<Icon name="key" size={14} /> Download SSH key
							</button>
						{/if}
						<div class="menu__title">Power</div>
						<ModalIcon
							icon={resource.status.powerState !== Compute.InstanceLifecyclePhase.Stopped
								? 'stop'
								: 'play'}
							label={resource.status.powerState !== Compute.InstanceLifecyclePhase.Stopped
								? 'Stop'
								: 'Start'}
							class="menu__item"
							title="Are you sure?"
							confirm={() =>
								resource.status.powerState !== Compute.InstanceLifecyclePhase.Stopped
									? stop(resource)
									: start(resource)}
							disabled={!MachineStatus.canStopOrStart(resource.status.powerState)}
						>
							{resource.status.powerState !== Compute.InstanceLifecyclePhase.Stopped
								? 'Stop'
								: 'Start'} instance?
						</ModalIcon>
						<ModalIcon
							icon="refresh"
							label="Soft reboot"
							class="menu__item"
							title="Soft reboot?"
							confirm={() => rebootSoft(resource)}
							disabled={!MachineStatus.canReboot(resource.status.powerState)}
						>
							Soft-reboot "{resource.metadata.name}"?
						</ModalIcon>
						<ModalIcon
							icon="restartAlert"
							label="Hard reboot"
							class="menu__item"
							title="Hard reboot?"
							confirm={() => rebootHard(resource)}
							disabled={!MachineStatus.canReboot(resource.status.powerState)}
						>
							Force-reboot "{resource.metadata.name}"?
						</ModalIcon>
						<div class="menu__title">Danger</div>
						<ModalIcon
							icon="trash"
							label="Delete"
							class="menu__item menu__item--danger"
							title="Delete instance?"
							confirm={() => deleteInstance(resource)}
						>
							Removing "{resource.metadata.name}" is permanent.
						</ModalIcon>
					{/snippet}
					<ShellListItemMetadata metadata={resource.metadata}>
						{#if lookupNetwork(resource.status.networkId)}<ShellMetadataItem
								icon="network"
								label="Network"
								value={lookupNetwork(resource.status.networkId).metadata.name}
							/>{/if}
						{#if resource.status.privateIP}
							<ShellMetadataItem label="Private" value={resource.status.privateIP} />
						{/if}
						{#if resource.status.publicIP}
							<ShellMetadataItem label="Public" value={resource.status.publicIP} />
						{/if}
						{#if sshCertificateAuthorityName(resource)}
							<ShellMetadataItem
								label="SSH CA"
								value={sshCertificateAuthorityName(resource) ?? ''}
							/>
						{/if}
					</ShellListItemMetadata>
				</ShellListItem>{/each}</ShellList
		>{/snippet}
	{#snippet empty()}
		{#if !data.projects.length}
			<Placeholder
				>You are not a member of any projects — ask an administrator to add you.</Placeholder
			>
		{:else}
			<Placeholder>No compute instances yet — create one to get started.</Placeholder>
		{/if}
	{/snippet}
</ListPage>
