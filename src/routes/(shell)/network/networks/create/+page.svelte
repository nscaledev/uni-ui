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
	import InputChips from '$lib/forms/InputChips.svelte';
	import Icon from '$lib/primitives/Icon.svelte';

	// eslint-disable-next-line svelte/valid-compile
	const organizationID = data.organizationID;
	// eslint-disable-next-line svelte/valid-compile
	const projectID = data.projectID;
	// eslint-disable-next-line svelte/valid-compile
	const regionID = data.regionID;

	let resource: Region.NetworkV2Create = $state({
		metadata: {
			name: uniqueNamesGenerator({ dictionaries: [adjectives, animals], separator: '-', length: 2 })
		},
		spec: {
			organizationId: organizationID,
			projectId: projectID,
			regionId: regionID,
			prefix: '192.168.0.0/24',
			dnsNameservers: [],
			routes: []
		}
	});

	let routes: Array<Region.Route> = $state([]);
	let metadataValid = $state(false);
	let routeActive = $state(false);
	let valid = $derived(metadataValid && !routeActive);

	function routeAdd(): number {
		routes.push({ prefix: '', nexthop: '' });
		return routes.length - 1;
	}

	function routeRemove(index: number) {
		routes.splice(index, 1);
	}

	function submit() {
		resource.spec.routes = routes.length > 0 ? routes : undefined;
		Clients.region()
			.apiV2NetworksPost({ networkV2Create: resource })
			.then(() => window.location.assign('/network/networks'))
			.catch((e: Error) => Clients.error(e));
	}

	const projectName = $derived(
		data.projects?.find((p) => p.metadata.id === projectID)?.metadata.name ?? projectID
	);
	const regionName = $derived(RegionUtil.name(data.regions, regionID));
</script>

<FormPage
	breadcrumb={[{ label: 'Networks', href: '/network/networks' }, { label: 'Create' }]}
	cancelHref="/network/networks"
	submitLabel="Create Network"
	description="Provision an isolated virtual network for your resources."
	onSubmit={submit}
	{valid}
>
	{#snippet form()}
		<ShellMetadataSection metadata={resource.metadata} names={[]} bind:valid={metadataValid} />

		<ShellSection title="Configuration">
			<TextInput
				label="Network prefix"
				hint="Must be at least a /24. The top /25 is reserved for storage integration."
				bind:value={resource.spec.prefix}
			/>
			<InputChips
				label="DNS nameservers"
				hint="Leave empty to use the platform's internal DNS, which lets hosts on this network resolve each other by name. Explicit nameservers (e.g. 8.8.8.8) disable internal host resolution."
				name="dns-nameservers"
				bind:value={resource.spec.dnsNameservers}
			/>
		</ShellSection>

		<ResourceList
			title="Host Routes"
			columns={2}
			items={routes}
			bind:active={routeActive}
			add={routeAdd}
			remove={routeRemove}
		>
			{#snippet normal(route: Region.Route)}
				<div class="route-cell"><Icon name="network" size={16} />{route.prefix || '—'}</div>
				<div class="route-cell"><Icon name="arrowRight" size={16} />{route.nexthop || '—'}</div>
			{/snippet}
			<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
			{#snippet expanded(_route: Region.Route, index: number)}
				<TextInput
					label="Prefix"
					hint="Destination CIDR, e.g. 10.0.0.0/8"
					bind:value={routes[index].prefix}
				/>
				<TextInput
					label="Next hop"
					hint="Gateway IPv4 address"
					bind:value={routes[index].nexthop}
				/>
			{/snippet}
		</ResourceList>
	{/snippet}

	{#snippet summary()}
		<dl class="summary">
			<dt>Project</dt>
			<dd>{projectName}</dd>
			<dt>Region</dt>
			<dd>{RegionUtil.flag(data.regions, regionID)} {regionName}</dd>
			<dt>Name</dt>
			<dd>{resource.metadata.name || '—'}</dd>
			<dt>Prefix</dt>
			<dd>{resource.spec.prefix}</dd>
			{#if resource.spec.dnsNameservers?.length}
				<dt>DNS</dt>
				<dd>{resource.spec.dnsNameservers.join(', ')}</dd>
			{/if}
			{#if routes.length}
				<dt>Routes</dt>
				<dd>{routes.length} host route{routes.length === 1 ? '' : 's'}</dd>
			{/if}
		</dl>
	{/snippet}
</FormPage>

<style>
	.route-cell {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
	}
</style>
