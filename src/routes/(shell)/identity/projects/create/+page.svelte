<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	import * as Clients from '$lib/clients';
	import * as Identity from '$lib/openapi/identity';
	import FormPage from '$lib/layouts/FormPage.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import MultiSelect from '$lib/forms/MultiSelect.svelte';
	let names: Array<string> = $derived(data.projects.map((x) => x.metadata.name));
	let resource: Identity.ProjectWrite = $state({ metadata: { name: '' }, spec: { groupIDs: [] } });
	let metadataValid = $state(false);
	let valid = $derived(
		metadataValid && resource.spec.groupIDs != null && resource.spec.groupIDs.length > 0
	);
	let groups = $derived(data.groups.map((x) => ({ label: x.metadata.name, value: x.metadata.id })));
	function submit() {
		Clients.identity()
			.apiV1OrganizationsOrganizationIDProjectsPost({
				organizationID: data.organizationID,
				projectWrite: resource
			})
			.then(() => window.location.assign('/identity/projects'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<FormPage
	breadcrumb={[{ label: 'Projects', href: '/identity/projects' }, { label: 'Create' }]}
	cancelHref="/identity/projects"
	submitLabel="Create Project"
	description="Projects scope infrastructure resources to a team or workload."
	onSubmit={submit}
	{valid}
>
	{#snippet form()}
		<ShellMetadataSection metadata={resource.metadata} {names} bind:valid={metadataValid} />
		<ShellSection title="Groups">
			<MultiSelect
				label="Select group access."
				hint="Groups associate users with projects and grant them permissions to create, view, edit and delete."
				options={groups}
				value={resource.spec.groupIDs || []}
				onValueChange={(e) => (resource.spec.groupIDs = e.value)}
			>
				{#snippet selected(value: string)}{data.groups.find((x) => x.metadata.id == value)?.metadata
						.name}{/snippet}
			</MultiSelect>
		</ShellSection>
	{/snippet}
</FormPage>
