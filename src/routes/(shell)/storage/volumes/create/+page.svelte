<script lang="ts">
	import type { PageData } from './$types';
	import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';
	import * as Clients from '$lib/clients';
	import * as Region from '$lib/openapi/region';
	import * as RegionUtil from '$lib/regionutil';
	import FormPage from '$lib/layouts/FormPage.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import NumberInput from '$lib/forms/NumberInput.svelte';
	import Select from '$lib/forms/Select.svelte';

	let { data }: { data: PageData } = $props();
	let metadataValid = $state(false);
	let resource: Region.VolumeV2Create = $state({
		metadata: {
			name: uniqueNamesGenerator({ dictionaries: [adjectives, animals], separator: '-', length: 2 })
		},
		spec: { networkId: '', volumeClassId: '', sizeGiB: 10 }
	});
	const compatibleNetworks = $derived(
		data.networks.filter((network) =>
			data.volumeClasses.some(
				(volumeClass) => volumeClass.spec.regionId === network.status.regionId
			)
		)
	);
	const network = $derived(
		compatibleNetworks.find((item) => item.metadata.id === resource.spec.networkId)
	);
	const volumeClasses = $derived(
		data.volumeClasses.filter((item) => item.spec.regionId === network?.status.regionId)
	);
	const volumeClass = $derived(
		volumeClasses.find((item) => item.metadata.id === resource.spec.volumeClassId)
	);
	const minimumSizeGiB = $derived(volumeClass?.spec.minimumSizeGiB ?? 1);
	const maximumSizeGiB = $derived(volumeClass?.spec.maximumSizeGiB);
	const volumeClassHint = $derived(
		volumeClass
			? [
					volumeClass.spec.media?.toUpperCase(),
					volumeClass.spec.encrypted ? 'Encrypted' : 'Not encrypted',
					volumeClass.spec.performance?.maxIOPS === undefined
						? undefined
						: `${volumeClass.spec.performance.maxIOPS} max IOPS`,
					volumeClass.spec.performance?.maxThroughputMiBps === undefined
						? undefined
						: `${volumeClass.spec.performance.maxThroughputMiBps} MiB/s max throughput`
				]
					.filter(Boolean)
					.join(' · ')
			: ''
	);
	const projectName = $derived(
		data.projects.find((item) => item.metadata.id === network?.metadata.projectId)?.metadata.name ??
			network?.metadata.projectId ??
			'—'
	);
	const regionName = $derived(
		network ? RegionUtil.name(data.regions, network.status.regionId) : '—'
	);
	const valid = $derived(
		metadataValid &&
			!!resource.spec.networkId &&
			!!resource.spec.volumeClassId &&
			!!volumeClass &&
			Number.isInteger(resource.spec.sizeGiB) &&
			resource.spec.sizeGiB >= minimumSizeGiB &&
			(maximumSizeGiB === undefined || resource.spec.sizeGiB <= maximumSizeGiB)
	);

	function selectVolumeClass(id: string): void {
		resource.spec.volumeClassId = id;
		const selectedVolumeClass = volumeClasses.find((item) => item.metadata.id === id);
		if (!selectedVolumeClass) return;

		const minimum = selectedVolumeClass.spec.minimumSizeGiB ?? 1;
		const maximum = selectedVolumeClass.spec.maximumSizeGiB ?? Infinity;
		const size = Number.isFinite(resource.spec.sizeGiB) ? resource.spec.sizeGiB : minimum;
		resource.spec.sizeGiB = Math.min(Math.max(size, minimum), maximum);
	}

	$effect(() => {
		if (!compatibleNetworks.some((item) => item.metadata.id === resource.spec.networkId)) {
			resource.spec.networkId = compatibleNetworks[0]?.metadata.id ?? '';
		}

		const volumeClassID = (volumeClass ?? volumeClasses[0])?.metadata.id ?? '';
		if (resource.spec.volumeClassId !== volumeClassID) selectVolumeClass(volumeClassID);
	});

	function submit() {
		Clients.region()
			.apiV2VolumesPost({ volumeV2Create: resource })
			.then(() => window.location.assign('/storage/volumes'))
			.catch((error: Error) => Clients.error(error));
	}
</script>

<FormPage
	breadcrumb={[{ label: 'Volumes', href: '/storage/volumes' }, { label: 'Create' }]}
	cancelHref="/storage/volumes"
	submitLabel="Create Volume"
	description="Provision block storage on a private network."
	onSubmit={submit}
	{valid}
>
	{#snippet form()}
		<ShellMetadataSection metadata={resource.metadata} names={[]} bind:valid={metadataValid} />
		<ShellSection title="Configuration">
			<Select label="Network" bind:value={resource.spec.networkId}>
				{#each compatibleNetworks as item (item.metadata.id)}
					<option value={item.metadata.id}>{item.metadata.name}</option>
				{/each}
			</Select>
			<Select
				label="Volume class"
				hint={volumeClassHint}
				onchange={selectVolumeClass}
				bind:value={resource.spec.volumeClassId}
			>
				{#each volumeClasses as item (item.metadata.id)}
					<option value={item.metadata.id}>{item.metadata.name}</option>
				{/each}
			</Select>
			<NumberInput
				label="Size (GiB)"
				hint={maximumSizeGiB === undefined
					? `At least ${minimumSizeGiB} GiB.`
					: `Between ${minimumSizeGiB} and ${maximumSizeGiB} GiB.`}
				min={minimumSizeGiB}
				max={maximumSizeGiB}
				bind:value={resource.spec.sizeGiB}
			/>
		</ShellSection>
	{/snippet}
	{#snippet summary()}<dl class="summary">
			<dt>Project</dt>
			<dd>{projectName}</dd>
			<dt>Region</dt>
			<dd>{network ? RegionUtil.flag(data.regions, network.status.regionId) : ''} {regionName}</dd>
			<dt>Name</dt>
			<dd>{resource.metadata.name || '—'}</dd>
			<dt>Network</dt>
			<dd>{network?.metadata.name ?? '—'}</dd>
			<dt>Volume class</dt>
			<dd>{volumeClass?.metadata.name ?? '—'}</dd>
			<dt>Size</dt>
			<dd>{resource.spec.sizeGiB} GiB</dd>
		</dl>{/snippet}
</FormPage>
