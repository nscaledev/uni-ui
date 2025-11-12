<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { navigating } from '$app/state';

	let { data }: { data: PageData } = $props();

	import * as Clients from '$lib/clients';
	import * as Compute from '$lib/openapi/compute';
	import * as Region from '$lib/openapi/region';
	import * as RegionUtil from '$lib/regionutil';
	import * as MachineStatus from '$lib/machineStatus';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellList from '$lib/layouts/ShellList.svelte';
	import ShellListItem from '$lib/layouts/ShellListItem.svelte';
	import ShellListItemHeader from '$lib/layouts/ShellListItemHeader.svelte';
	import ShellListItemBadges from '$lib/layouts/ShellListItemBadges.svelte';
	import ShellListItemMetadata from '$lib/layouts/ShellListItemMetadata.svelte';
	import Badge from '$lib/layouts/Badge.svelte';
	import PopupButton from '$lib/forms/PopupButton.svelte';
	import ModalIcon from '$lib/layouts/ModalIcon.svelte';
	import Placeholder from '$lib/layouts/Placeholder.svelte';

	const settings: ShellPageSettings = {
		feature: 'Infrastructure',
		name: 'Compute Instances',
		description: 'Manage your Compute instances.',
		icon: 'mdi:server-network-outline'
	};

	onMount(() => {
		const interval = setInterval(() => navigating.to || invalidate('layout:instances'), 5000);

		return () => clearInterval(interval);
	});

	let networkID = $state(data.networks[0]?.metadata.id);

	function lookupNetwork(id: string): Region.NetworkV2Read {
		return data.networks.find((x) => x.metadata.id == id) as Region.NetworkV2Read;
	}

	let network = $derived.by(() => {
		if (networkID) return lookupNetwork(networkID);
	});

	function confirm(resource: Compute.InstanceRead): void {
		const parameters = {
			instanceID: resource.metadata.id
		};

		Clients.compute()
			.apiV2InstancesInstanceIDDelete(parameters)
			.then(() => invalidate('layout:clusters'))
			.catch((e: Error) => Clients.error(e));
	}

	function start(resource: Compute.InstanceRead): void {
		const parameters = {
			instanceID: resource.metadata.id
		};

		Clients.compute()
			.apiV2InstancesInstanceIDStartPost(parameters)
			.catch((e: Error) => Clients.error(e));
	}

	function stop(resource: Compute.InstanceRead): void {
		const parameters = {
			instanceID: resource.metadata.id
		};

		Clients.compute()
			.apiV2InstancesInstanceIDStopPost(parameters)
			.catch((e: Error) => Clients.error(e));
	}

	function rebootSoft(resource: Compute.InstanceRead): void {
		const parameters = {
			instanceID: resource.metadata.id
		};

		Clients.compute()
			.apiV2InstancesInstanceIDRebootPost(parameters)
			.catch((e: Error) => Clients.error(e));
	}

	function rebootHard(resource: Compute.InstanceRead): void {
		const parameters = {
			instanceID: resource.metadata.id,
			hard: true
		};

		Clients.compute()
			.apiV2InstancesInstanceIDRebootPost(parameters)
			.catch((e: Error) => Clients.error(e));
	}
</script>

<ShellPageHeader {settings}>
	{#snippet tools()}
		{#if data.projects.length}
			<PopupButton icon="mdi:add" class="self-end" label="Create">
				{#snippet contents()}
					<div class="flex flex-col gap-4">
						<div class="font-bold">Network</div>

						<div class="input-group grid grid-cols-[auto_1fr]">
							<iconify-icon icon="mdi:network-outline" class="ig-cell"></iconify-icon>

							<select class="ig-select" bind:value={networkID}>
								{#each data.networks as p}
									<option value={p.metadata.id}>{p.metadata.name}</option>
								{/each}
							</select>
						</div>

						<a
							href={'/compute/instances/create' +
								'?projectID=' +
								network?.metadata.projectId +
								'&regionID=' +
								network?.status.regionId +
								'&networkID=' +
								network?.metadata.id}
							class="btn preset-filled-primary-500">Create</a
						>
					</div>
				{/snippet}
			</PopupButton>
		{/if}
	{/snippet}
</ShellPageHeader>

{#if data.projects.length == 0}
	<Placeholder
		>You are not yet a member of any projects, ask an administrator to create one.</Placeholder
	>
{:else if data.instances.length == 0}
	<Placeholder>No instances to display, create one to get started.</Placeholder>
{:else}
	<ShellList>
		{#each data.instances as resource}
			<ShellListItem>
				{#snippet main()}
					<ShellListItemHeader
						metadata={resource.metadata}
						projects={data.projects}
						href="/compute/instances/edit/{resource.metadata.id}"
					/>
				{/snippet}

				{#snippet badges()}
					<ShellListItemBadges metadata={resource.metadata}>
						{#snippet extra()}
							<Badge icon={RegionUtil.icon(data.regions, resource.status.regionId)}>
								{RegionUtil.name(data.regions, resource.status.regionId)}
							</Badge>
							<Badge icon="mdi:network-outline">
								{lookupNetwork(resource.status.networkId).metadata.name}
							</Badge>
						{/snippet}
					</ShellListItemBadges>
				{/snippet}

				<ShellListItemMetadata metadata={resource.metadata} />

				{#snippet trail()}
					<ModalIcon
						icon={resource.status.powerState !== Compute.InstanceLifecyclePhase.Stopped
							? 'mdi:stop'
							: 'mdi:play'}
						label={resource.status.powerState !== Compute.InstanceLifecyclePhase.Stopped
							? 'Stop'
							: 'Start'}
						title="Are you sure?"
						confirm={() =>
							resource.status.powerState !== Compute.InstanceLifecyclePhase.Stopped
								? stop(resource)
								: start(resource)}
						disabled={!MachineStatus.canStopOrStart(resource.status.powerState)}
					></ModalIcon>
					<ModalIcon
						icon="mdi:restart"
						label="Soft Reboot"
						title="Are you sure?"
						confirm={() => rebootSoft(resource)}
						disabled={!MachineStatus.canReboot(resource.status.powerState)}
					></ModalIcon>
					<ModalIcon
						icon="mdi:restart-alert"
						label="Hard Reboot"
						title="Are you sure?"
						confirm={() => rebootHard(resource)}
						disabled={!MachineStatus.canReboot(resource.status.powerState)}
					></ModalIcon>
					<ModalIcon
						icon="mdi:trash-can-outline"
						label="Delete"
						title="Are you sure?"
						confirm={() => confirm(resource)}
					></ModalIcon>
				{/snippet}
			</ShellListItem>
		{/each}
	</ShellList>
{/if}
