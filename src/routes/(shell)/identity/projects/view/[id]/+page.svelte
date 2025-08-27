<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';

	let { data }: { data: PageData } = $props();

	import * as Clients from '$lib/clients';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellViewHeader from '$lib/layouts/ShellViewHeader.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import MultiSelect from '$lib/forms/MultiSelect.svelte';
	import Button from '$lib/forms/Button.svelte';

	const settings: ShellPageSettings = {
		feature: 'Identity',
		name: 'View/Update Project',
		description: 'Manage your project.',
		icon: 'mdi:folder-open-outline'
	};

	let project = $derived.by(() => {
		let project = $state(data.project);
		return project;
	});

	let names: Array<string> = $derived(
		data.projects.filter((x) => x.metadata.id != $page.params.id).map((x) => x.metadata.name)
	);

	let metadataValid = $state(false);

	let valid = $derived(
		metadataValid && project?.spec.groupIDs && project?.spec.groupIDs.length != 0
	);

	function submit() {
		const parameters = {
			organizationID: data.organizationID,
			projectID: project.metadata.id,
			projectWrite: project
		};

		Clients.identity()
			.apiV1OrganizationsOrganizationIDProjectsProjectIDPut(parameters)
			.then(() => window.location.assign('/identity/projects'))
			.catch((e: Error) => Clients.error(e));
	}

	let groups = $derived(data.groups.map((x) => ({ label: x.metadata.name, value: x.metadata.id })));
</script>

<ShellPageHeader {settings} />
<ShellViewHeader metadata={project.metadata} />
<ShellMetadataSection metadata={project.metadata} {names} bind:valid={metadataValid} />

<ShellSection title="Groups">
	<MultiSelect
		label="Select group access."
		hint="Groups associate users with projects and grant them permissions to create, view, edit and delete."
		options={groups}
		value={project.spec.groupIDs}
		onValueChange={(e) => (project.spec.groupIDs = e.value)}
	>
		{#snippet selected(value: string)}
			{data.groups.find((x) => x.metadata.id == value)?.metadata.name}
		{/snippet}
	</MultiSelect>
</ShellSection>

<div class="flex justify-between">
	<Button
		icon="mdi:cancel-bold"
		label="Cancel"
		class="preset-outlined-surface-600-400"
		href="/identity/projects"
	/>
	<Button
		icon="mdi:tick"
		label="Update"
		class="preset-filled-primary-500"
		clicked={submit}
		disabled={!valid}
	/>
</div>
