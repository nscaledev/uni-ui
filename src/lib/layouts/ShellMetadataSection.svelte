<script lang="ts">
	import * as Validation from '$lib/validation';
	import * as Kubernetes from '$lib/openapi/kubernetes';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import TextInput from '$lib/forms/TextInput.svelte';

	// A list of names that already exist in this context for validation,
	// so ensure you prune out the current one when using in an update

	interface Props {
		// Metadata object to bind to.
		metadata: Kubernetes.ResourceMetadata;
		// dialog.
		names?: Array<string>;
		// Whether the input is valid.
		valid?: boolean;
	}

	let { metadata = $bindable(), names, valid = $bindable(false) }: Props = $props();
</script>

<ShellSection title="Resource Metadata">
	<TextInput
		bind:value={metadata.name}
		label="Resource name."
		hint="Name should be unique, contain 0-9, a-z, . or - and be at most 63 characters."
		validators={Validation.GetKubernetesNameValidators(names)}
		bind:valid
	/>
	<TextInput
		bind:value={metadata.description}
		label="Resource decription."
		hint="This is optional but may add more verbose information about the resource."
	/>
</ShellSection>
