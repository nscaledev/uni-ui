<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

	import * as Clients from '$lib/clients';
	import * as Region from '$lib/openapi/region';
	import * as RegionUtil from '$lib/regionutil';

	import FormPage from '$lib/layouts/FormPage.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import ResourceList from '$lib/layouts/ResourceList.svelte';
	import TextInput from '$lib/forms/TextInput.svelte';
	import Switch from '$lib/forms/Switch.svelte';
	import LoadBalancerListenerV2 from '$lib/layouts/LoadBalancerListenerV2.svelte';
	import Icon from '$lib/primitives/Icon.svelte';

	function initialNetworkID(): string {
		return data.network.metadata.id;
	}

	function defaultListener(index: number): Region.LoadBalancerListenerV2 {
		return {
			name: `listener-${index}`,
			protocol: Region.LoadBalancerListenerProtocolV2.Tcp,
			port: 80,
			allowedCidrs: [],
			idleTimeoutSeconds: undefined,
			pool: {
				proxyProtocolV2: false,
				members: [],
				healthCheck: undefined
			}
		};
	}

	let resource: Region.LoadBalancerV2Create = $state({
		metadata: {
			name: uniqueNamesGenerator({
				dictionaries: [adjectives, animals],
				separator: '-',
				length: 2
			}),
			description: '',
			tags: []
		},
		spec: {
			networkId: initialNetworkID(),
			publicIP: false,
			listeners: [defaultListener(1)]
		}
	});

	let metadataValid = $state(false);
	let listenerActive = $state(false);
	let listenerValid = $state(true);

	let names = $derived(data.loadBalancers.map((x) => x.metadata.name));

	let valid = $derived(
		metadataValid && !listenerActive && listenerValid && resource.spec.listeners.length > 0
	);

	const regionName = $derived(RegionUtil.name(data.regions, data.network.status.regionId));

	function addListener(): number {
		resource.spec.listeners.push(defaultListener(resource.spec.listeners.length + 1));
		return resource.spec.listeners.length - 1;
	}

	function removeListener(index: number) {
		resource.spec.listeners.splice(index, 1);
	}

	function submit() {
		const request: Region.LoadBalancerV2Create = {
			metadata: {
				name: resource.metadata.name,
				description: resource.metadata.description,
				tags: resource.metadata.tags || []
			},
			spec: {
				networkId: resource.spec.networkId,
				publicIP: resource.spec.publicIP ?? false,
				listeners: resource.spec.listeners
			}
		};

		if (resource.spec.vipAddress) {
			request.spec.vipAddress = resource.spec.vipAddress;
		}

		Clients.region()
			.apiV2LoadbalancersPost({ loadBalancerV2Create: request })
			.then((response) =>
				window.location.assign(
					response.metadata.id
						? `/network/loadbalancers/view/${response.metadata.id}`
						: '/network/loadbalancers'
				)
			)
			.catch((e: Error) => Clients.error(e));
	}

	function printListenerProtocol(listener: Region.LoadBalancerListenerV2): string {
		return listener.protocol.toUpperCase();
	}
</script>

<FormPage
	breadcrumb={[{ label: 'Load Balancers', href: '/network/loadbalancers' }, { label: 'Create' }]}
	cancelHref="/network/loadbalancers"
	submitLabel="Create Load Balancer"
	description="Configure and deploy a new load balancer."
	onSubmit={submit}
	{valid}
>
	{#snippet summary()}
		<dl class="summary">
			<dt>Network</dt>
			<dd>{data.network.metadata.name}</dd>
			<dt>Region</dt>
			<dd>{RegionUtil.flag(data.regions, data.network.status.regionId)} {regionName}</dd>
			<dt>Name</dt>
			<dd>{resource.metadata.name || '—'}</dd>
			<dt>Listeners</dt>
			<dd>{resource.spec.listeners.length}</dd>
			{#if resource.spec.publicIP}
				<dt>Public IP</dt>
				<dd>Requested</dd>
			{/if}
		</dl>
	{/snippet}

	{#snippet form()}
		<ShellMetadataSection metadata={resource.metadata} {names} bind:valid={metadataValid} />

		<ShellSection title="Configuration">
			<Switch
				name="load-balancer-public-ip"
				initial={resource.spec.publicIP ?? false}
				label="Allocate a public IP."
				onCheckedChange={(event) => (resource.spec.publicIP = event.checked)}
			/>
			<TextInput
				bind:value={resource.spec.vipAddress}
				label="Requested VIP address."
				hint="Leave this empty to let the backend choose an address."
			/>
		</ShellSection>

		<ResourceList
			title="Listeners"
			columns={4}
			items={resource.spec.listeners}
			bind:active={listenerActive}
			valid={listenerValid}
			add={addListener}
			remove={removeListener}
		>
			{#snippet normal(listener: Region.LoadBalancerListenerV2, index: number)}
				<div class="icon-cell">
					<Icon name="tag" size={14} />{listener.name || `Listener ${index + 1}`}
				</div>
				<div class="icon-cell">
					<Icon name="link" size={14} />{printListenerProtocol(listener)}
				</div>
				<div class="icon-cell"><Icon name="usb" size={14} />{listener.port}</div>
				<div class="icon-cell">
					<Icon name="network" size={14} />{listener.pool.members.length} members
				</div>
			{/snippet}

			<!-- eslint-disable @typescript-eslint/no-unused-vars -->
			{#snippet expanded(listener: Region.LoadBalancerListenerV2, index: number)}
				<LoadBalancerListenerV2
					bind:listener={resource.spec.listeners[index]}
					bind:valid={listenerValid}
				/>
			{/snippet}
		</ResourceList>
	{/snippet}
</FormPage>
