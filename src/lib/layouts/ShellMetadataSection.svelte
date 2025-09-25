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
		hint={Validation.kubernetesLabelValueHint}
		validators={Validation.GetKubernetesLabelValueValidators(names)}
		bind:valid
	/>
	<TextInput
		bind:value={metadata.description}
		label="Resource description."
		hint="This is optional but may add more verbose information about the resource."
	/>
</ShellSection>
